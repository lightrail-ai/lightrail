import {
  LightrailKBDocument,
  LightrailKBItem,
  LightrailKBSource,
  LightrailDataStores,
} from "lightrail-sdk";
import log from "../logger";
import * as workers from "../worker-management";
import { LightrailVectorStore, VectorStoreItem } from "./vector";
import { openDb } from "./sqlite";
import { createHash } from "crypto";
import * as fs from "fs/promises";
import { CHUNKABLE_CODE_EXTENSIONS } from "../transforms";
import { RecursiveUrlLoader } from "langchain/document_loaders/web/recursive_url";
import transforms from "../transforms";
import pdf2md from "@opendocsg/pdf2md";
import { removeStopwords } from "stopword";

export const INDEXABLE_FILE_EXTENSIONS = [
  ...CHUNKABLE_CODE_EXTENSIONS,
  "md",
  "txt",
  "pdf",
];

type LightrailKBType = LightrailDataStores["kb"];

export class LightrailKB implements LightrailKBType {
  _vectorStore = new LightrailVectorStore({ name: "kb" });
  _className = "item";
  _vectorizer:
    | {
        vectorize: (content: string[]) => Promise<number[][]>;
      }
    | undefined;

  async _setup() {
    await this._vectorStore.ensureClass({
      class: this._className,
      description: "Knowledge Base Items",
      properties: [
        {
          name: "title",
          dataType: ["text"],
        },
        {
          name: "itemId",
          dataType: ["int"],
        },
        {
          name: "documentId",
          dataType: ["int"],
        },
        {
          name: "content",
          dataType: ["text"],
          indexSearchable: true,
        },
        {
          name: "tags",
          dataType: ["text[]"],
        },
      ],
    });
  }

  async _getVectorizer() {
    if (!this._vectorizer) {
      this._vectorizer = await workers.getVectorizer();
    }
    return this._vectorizer;
  }

  async addSource(
    source: LightrailKBSource,
    options?: {
      onProgress?: (progressUpdate: {
        message: string;
        progress: [number, number] | undefined;
      }) => void;
    }
  ) {
    log.info("Adding source to KB...");
    const sqliteDb = await openDb();

    const protocol = source.uri.split("://")[0];
    if (!["file", "http", "https"].includes(protocol)) {
      throw new Error(
        "Unsupported protocol: URI for a source must start with 'file:', 'http:', or 'https:'"
      );
    }

    // Check if source with this URI already exists
    const existingSource = await sqliteDb.get(
      "SELECT * FROM KBSource WHERE uri = ?",
      [source.uri]
    );

    let sourceId: number;

    if (!existingSource) {
      await sqliteDb.run(
        "INSERT INTO KBSource (recursive, uri, frequency, refreshedAt) VALUES (?, ?, ?, unixepoch())",
        [source.recursive, source.uri, source.frequency]
      );

      // Get the last inserted source id
      ({ sourceId } = (await sqliteDb.get(
        "SELECT last_insert_rowid() as sourceId"
      ))!);
    } else {
      log.info("Source with this uri already exists, updating...");
      sourceId = existingSource.id;
      if (source.frequency !== existingSource.frequency) {
        await sqliteDb.run("UPDATE KBSource SET frequency = ? WHERE uri = ?", [
          source.frequency,
          source.uri,
        ]);
      }
    }

    for (const tag of source.tags) {
      // Insert tag into KBTags table if not exists
      await sqliteDb.run(`INSERT OR IGNORE INTO KBTags (tag) VALUES (?)`, [
        tag,
      ]);

      // Get the tag id
      const { id } = await sqliteDb.get("SELECT id FROM KBTags WHERE tag = ?", [
        tag,
      ]);

      // Add a row to the join table
      await sqliteDb.run(
        `INSERT OR IGNORE INTO KBSource_KBTags (sourceId, tagId) VALUES (?, ?)`,
        [sourceId, id]
      );
    }

    await this.__processSource(sourceId, options);
  }

  async __processSource(
    sourceId: number,
    options?: {
      onProgress?: (progressUpdate: {
        message: string;
        progress: [number, number] | undefined;
      }) => void;
    }
  ) {
    const sqliteDb = await openDb();

    // update source refreshedAt
    await sqliteDb.run(
      "UPDATE KBSource SET refreshedAt = unixepoch() WHERE id = ?",
      [sourceId]
    );

    // get source
    const source: (LightrailKBSource & { id: number }) | undefined =
      await sqliteDb
        .get(
          `SELECT KBSource.*, GROUP_CONCAT(KBTags.tag) AS tags
        FROM KBSource 
        JOIN KBSource_KBTags ON KBSource.id == KBSource_KBTags.sourceId
        JOIN KBTags ON KBSource_KBTags.tagId == KBTags.id
        WHERE KBSource.id == ?
      `,
          [sourceId]
        )
        .then((s) => {
          if (s) {
            return {
              ...s,
              tags: s.tags.split(","),
            };
          }
        });

    if (!source) {
      throw new Error("Source not found");
    }

    const [protocol, path] = source.uri.split("://", 2);

    const items: LightrailKBItem[] = [];

    options?.onProgress?.({
      message: `Chunking documents from source '${source.uri}'...`,
      progress: undefined,
    });

    const { timestamp } = await sqliteDb.get("SELECT unixepoch() as timestamp");

    switch (protocol) {
      case "file":
        const { globby } = await import("globby");
        // check if path exists
        fs.access(path);
        if (source.recursive) {
          let children = await globby(
            `**/*.{${INDEXABLE_FILE_EXTENSIONS.join(",")}}`,
            {
              ignore: ["**/package-lock.json", "**/*.min.*"],
              dot: false,
              gitignore: true,
              cwd: path,
            }
          );
          for (const p of children) {
            items.push(
              ...(await this.addDocument(
                {
                  tags: source.tags,
                  title: `${source.uri.replace(/\/$/, "")}/${p}`,
                  type:
                    p.endsWith(".md") ||
                    p.endsWith(".txt") ||
                    p.endsWith(".pdf")
                      ? "text"
                      : "code",
                  uri: `${source.uri}/${p}`,
                  sourceId: source.id,
                },
                undefined,
                { skipAddingItems: true }
              ))
            );
          }
        } else {
          items.push(
            ...(await this.addDocument(
              {
                tags: source.tags,
                title: path,
                type:
                  path.endsWith(".md") ||
                  path.endsWith(".txt") ||
                  path.endsWith(".pdf")
                    ? "text"
                    : "code",
                uri: source.uri,
                sourceId: source.id,
              },
              undefined,
              { skipAddingItems: true }
            ))
          );
        }

        break;
      case "http":
      case "https":
        if (source.recursive) {
          const loader = new RecursiveUrlLoader(source.uri, {
            extractor: (s) => s,
            preventOutside: true,
            maxDepth: 99999,
          });
          const docs = await loader.load();
          for (const doc of docs) {
            items.push(
              ...(await this.addDocument(
                {
                  tags: source.tags,
                  title: doc.metadata.title,
                  type: "text",
                  uri: doc.metadata.source,
                  sourceId: source.id,
                },
                doc.pageContent,
                { skipAddingItems: true }
              ))
            );
          }
        } else {
          items.push(
            ...(await this.addDocument(
              {
                tags: source.tags,
                title: source.uri,
                type: "text",
                uri: source.uri,
                sourceId: source.id,
              },
              undefined,
              { skipAddingItems: true }
            ))
          );
        }
        break;
      default:
        throw new Error(
          "Unsupported protocol: URI for a source must start with 'file://', 'http://', or 'https://'"
        );
    }

    const batchSize = 25;

    if (!this._vectorizer == undefined) {
      options?.onProgress?.({
        message: `Initializing vectorizer...`,
        progress: [0, items.length],
      });
    }
    for (let i = 0; i < items.length; i += batchSize) {
      const chunk = items.slice(i, i + batchSize);
      await this.addItems(chunk);
      options?.onProgress?.({
        message: `Vectorizing ${items.length} chunks...`,
        progress: [Math.min(i + batchSize, items.length), items.length],
      });
    }

    // Clean up old documents that don't exist anymore, and associated items
    const docsToDelete = await sqliteDb.all(
      `SELECT id as docId FROM KBDocument WHERE sourceId = ? AND refreshedAt < ?`,
      [sourceId, timestamp]
    );
    await sqliteDb.run(
      `DELETE FROM KBDocument WHERE sourceId = ? AND refreshedAt < ?`,
      [sourceId, timestamp]
    );
    const vectorStoreClient = await this._vectorStore._getClient();
    for (const { docId } of docsToDelete) {
      await vectorStoreClient.batch
        .objectsBatchDeleter()
        .withWhere({
          operator: "Equal",
          path: ["documentId"],
          valueNumber: docId,
        })
        .withClassName(this._vectorStore._scopeClassName(this._className))
        .do();
    }
  }

  async addDocument(
    document: LightrailKBDocument,
    content?: string,
    options?: {
      skipAddingItems?: boolean;
    }
  ) {
    const [protocol, path] = document.uri.split("://", 2);

    // Filling content
    const isPdf = document.uri.endsWith(".pdf");
    if (!content) {
      if (protocol === "file") {
        if (isPdf) {
          content = await pdf2md(await fs.readFile(path));
        } else {
          content = await fs.readFile(path, "utf-8");
        }
      } else if (protocol === "http" || protocol === "https") {
        if (isPdf) {
          content = await pdf2md(
            await (await fetch(document.uri)).arrayBuffer()
          );
        } else {
          content = await (await fetch(document.uri)).text();
        }
      } else {
        throw new Error(
          `Unsupported protocol '${protocol}': URI for a document must start with 'file://', 'http://', or 'https://'`
        );
      }
    }
    if (protocol.startsWith("http") && !isPdf) {
      const { Readability } = await import("@mozilla/readability");
      const { parseHTML } = await import("linkedom");
      const { NodeHtmlMarkdown } = await import("node-html-markdown");

      let { document: htmlDoc } = parseHTML(
        `<html><body>${content}</body></html>`
      );

      let reader = new Readability(htmlDoc);
      let article = reader.parse();
      if (article?.content) {
        content = NodeHtmlMarkdown.translate(article.content);
      } else {
        content = htmlDoc.body.textContent || "(no content)";
      }
    }
    content = content ?? "";

    // get content hash
    const hash = createHash("md5").update(content).digest("hex");

    // Check if the document already exists
    const sqliteDb = await openDb();

    const existingDoc =
      document.uri && document.sourceId
        ? await sqliteDb.get(
            "SELECT * FROM KBDocument WHERE uri = ? AND sourceId = ?",
            [document.uri, document.sourceId]
          )
        : undefined;

    let documentId: number = existingDoc?.id;
    let items: LightrailKBItem[] = [];

    if (existingDoc && existingDoc.hash === hash) {
      await sqliteDb.run(
        "UPDATE KBDocument SET refreshedAt = unixepoch() WHERE id = ?",
        [existingDoc.id]
      );
      // Update all items with this documentId
      await sqliteDb.run(
        "UPDATE KBItem SET refreshedAt = unixepoch() WHERE documentId = ?",
        [existingDoc.id]
      );
      log.info(
        `Document at ${document.uri} is unchanged for this source, skipping...`
      );
    } else {
      if (existingDoc) {
        await sqliteDb.run(
          "UPDATE KBDocument SET refreshedAt = unixepoch(), hash = ? WHERE id = ?",
          [hash, existingDoc.id]
        );

        // Delete all items with this documentId
        await sqliteDb.run("DELETE FROM KBItem WHERE documentId = ?", [
          existingDoc.id,
        ]);
        const vectorStoreClient = await this._vectorStore._getClient();
        await vectorStoreClient.batch
          .objectsBatchDeleter()
          .withWhere({
            operator: "Equal",
            path: ["documentId"],
            valueNumber: existingDoc.id,
          })
          .withClassName(this._vectorStore._scopeClassName(this._className))
          .do();
      } else {
        await sqliteDb.run(
          "INSERT INTO KBDocument (uri, title, type, hash, refreshedAt, sourceId) VALUES (?, ?, ?, ?, unixepoch(), ?)",
          [document.uri, document.title, document.type, hash, document.sourceId]
        );
        const { lastID } = await sqliteDb.get(
          "SELECT last_insert_rowid() as lastID"
        );
        documentId = lastID;
      }

      const chunks = await transforms.toChunks(content, {
        path,
      });

      items = chunks.map((chunk) => ({
        title: document.title + ":" + chunk.from.line + "-" + chunk.to.line,
        type: document.type,
        content: chunk.content,
        metadata: {
          from: chunk.from,
          to: chunk.to,
        },
        tags: document.tags,
        documentId,
      }));
    }

    // Update tags
    for (const tag of document.tags) {
      // Insert tag into KBTags table if not exists
      await sqliteDb.run(`INSERT OR IGNORE INTO KBTags (tag) VALUES (?)`, [
        tag,
      ]);

      // Get the tag id
      const { id } = await sqliteDb.get("SELECT id FROM KBTags WHERE tag = ?", [
        tag,
      ]);

      // Add a row to the join table
      await sqliteDb.run(
        `INSERT OR IGNORE INTO KBDocument_KBTags (documentId, tagId) VALUES (?, ?)`,
        [documentId, id]
      );
    }

    // Add items if not skipped
    if (!options?.skipAddingItems && items.length > 0) {
      await this.addItems(items);
    }

    return items;
  }

  async addItems(items: LightrailKBItem[]) {
    log.info(`Add a batch of ${items.length} items to KB...`);

    await this._setup();
    const sqliteDb = await openDb();

    const sortedItems = [...items].sort((a, b) =>
      a.content.length > b.content.length ? 1 : -1
    );

    const sortedItemIds: number[] = [];

    log.info("Inserting items into SQLite database");
    for (const item of sortedItems) {
      // Insert the item into the 'KBItem' table
      await sqliteDb.run(
        "INSERT INTO KBItem (title, type, hash, refreshedAt, documentId) VALUES (?, ?, ?, unixepoch(), ?)",
        [
          item.title,
          item.type,
          createHash("md5").update(item.content).digest("hex"),
          item.documentId,
        ]
      );

      // Get the last inserted item id
      const { lastID } = await sqliteDb.get(
        "SELECT last_insert_rowid() as lastID"
      );

      sortedItemIds.push(lastID);

      // Assuming tags are an array of strings.
      for (const tag of item.tags) {
        // Check if the tag already exists in the 'KBTags' table, if not, insert it
        await sqliteDb.run(`INSERT OR IGNORE INTO KBTags (tag) VALUES (?)`, [
          tag,
        ]);

        // Get the tagId
        const { id: tagId } = await sqliteDb.get(
          "SELECT id FROM KBTags WHERE tag = ?",
          [tag]
        );

        // Add an entry to the 'KBItem_KBTags' join table linking the item to the tag
        await sqliteDb.run(
          `INSERT INTO KBItem_KBTags (itemId, tagId) VALUES (?, ?)`,
          [lastID, tagId]
        );
      }
    }
    log.info("Done inserting items into SQLite database");
    log.info("Vectorizing items");

    const vectorizer = await this._getVectorizer();
    const vectors: any[] = [];
    const vectorizingBatchSize = 5;

    for (let i = 0; i < sortedItems.length; i += vectorizingBatchSize) {
      const batch = sortedItems.slice(i, i + vectorizingBatchSize);
      const vecs = await vectorizer.vectorize(batch.map((i) => i.content));
      vectors.push(...vecs);
    }

    log.info("Done vectorizing items");
    log.info("Inserting items into vector store");

    await this._vectorStore.insertMany(
      this._className,
      sortedItems.map((item, i) => ({
        ...item,
        itemId: sortedItemIds[i],
        documentId: item.documentId,
        metadata: JSON.stringify(item.metadata ?? {}),
      })) as VectorStoreItem[],
      vectors as number[][]
    );

    log.info("Done inserting items into vector store");
  }

  async query(query: string, tags?: string[]): Promise<LightrailKBItem[]> {
    await this._setup();
    const vectorizer = await this._getVectorizer();
    const [vector] = await vectorizer.vectorize([query]);
    let getter = await this._vectorStore.query(this._className);
    let cleanedQuery = removeStopwords(query.split(/\s+/)).join(" ");
    log.info("Querying KB with cleaned query: ", cleanedQuery);
    getter = getter
      .withHybrid({
        query: cleanedQuery,
        properties: ["content"],
        alpha: 0.5,
        vector: vector,
      })
      .withAutocut(1)
      .withLimit(5)
      .withFields("title type content metadata tags _additional { distance }");
    if (tags) {
      getter = getter.withWhere({
        path: ["tags"],
        operator: "ContainsAny",
        valueStringArray: tags,
      });
    }
    const results = await getter.do();
    const items = results.data.Get[
      this._vectorStore._scopeClassName(this._className)
    ].map((i) => ({
      ...i,
      metadata: JSON.parse(i.metadata),
    })) as LightrailKBItem[];
    return items;
  }
}
