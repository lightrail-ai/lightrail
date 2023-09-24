import {
  LightrailDataStores,
  LightrailKBItem,
  LightrailTrack,
} from "lightrail-sdk";
import jsonStorage from "electron-json-storage";
import path from "path";
import type { EmbeddedClient } from "weaviate-ts-embedded";
import log from "./logger";
import * as workers from "./worker-management";
import { app } from "electron";

/* monkeypatch fetch to allow weaviate port */

// Get the badPorts list from the original undici module.
const badPorts = require("undici/lib/fetch/constants").badPorts;
// Remove envoy port
const index = badPorts.indexOf("6666");
if (index !== -1) {
  badPorts.splice(index, 1);
}
// Replace global fetch with our monkeypatched fetch
global.fetch = require("undici").fetch;

/* end monkeypatching */

export class LightrailKVStore {
  _track: LightrailTrack;
  _dataPath: string;
  constructor(track: LightrailTrack) {
    this._track = track;
    this._dataPath = path.join(jsonStorage.getDataPath(), "tracks", track.name);
  }
  get<T = any>(key: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      jsonStorage.get(
        key,
        {
          dataPath: this._dataPath,
        },
        (err, data: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(data?.value as T);
          }
        }
      );
    });
  }
  set(key: string, value: any) {
    return new Promise<void>((resolve, reject) => {
      jsonStorage.set(
        key,
        { value: value },
        {
          dataPath: this._dataPath,
        },
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }
}

type VectorStoreItem = { [key: string]: string | string[] | number | number[] };

export class LightrailVectorStore {
  _track: { name: string };
  _client: EmbeddedClient | undefined;
  _classes: Set<string> = new Set();

  constructor(track: { name: string }) {
    this._track = track;
  }

  _scopeClassName(className: string) {
    return `${this._track.name[0].toUpperCase()}${this._track.name.slice(
      1
    )}_${className}`;
  }

  async _getClient() {
    if (!this._client) {
      const { EmbeddedOptions, default: weaviate } = await import(
        "weaviate-ts-embedded"
      );
      const options = new EmbeddedOptions();
      options.binaryPath = path.join(
        app.getPath("appData"),
        "weaviate",
        "binary"
      );
      options.persistenceDataPath = path.join(
        app.getPath("appData"),
        "weaviate",
        "data"
      );
      this._client = weaviate.client(options);
      await this._client.embedded.start();
    }
    return this._client;
  }

  async ensureClass(
    classObj: { class: string } & { [prop: string]: any }
  ): Promise<string> {
    const client = await this._getClient();
    const scopedClassName = this._scopeClassName(classObj.class);
    if (this._classes.has(scopedClassName)) {
      return scopedClassName;
    }

    const scopedClassObj = {
      ...classObj,
      vectorizer: "none",
      class: scopedClassName,
    };
    try {
      await client.schema.classCreator().withClass(scopedClassObj).do();
    } catch (e) {
      log.warn(e);
    }

    this._classes.add(scopedClassName);

    return scopedClassName;
  }

  async insertOne(className: string, item: VectorStoreItem, vector: number[]) {
    const client = await this._getClient();

    const scopedClassName = this._scopeClassName(className);
    await client.data
      .creator()
      .withClassName(scopedClassName)
      .withProperties(item)
      .withVector(vector)
      .do();
  }

  async insertMany(
    className: string,
    items: VectorStoreItem[],
    vectors: number[][]
  ) {
    const client = await this._getClient();
    const scopedClassName = this._scopeClassName(className);
    let batcher = client.batch.objectsBatcher();
    for (let i = 0; i < items.length; i++) {
      batcher = batcher.withObject({
        class: scopedClassName,
        properties: items[i],
        vector: vectors[i],
      });
    }
    const res = await batcher.do();
    log.silly("Finished weaviate batch insert");
    res.forEach((r) => r.result?.errors && log.error(r.result?.errors));
  }

  async query(className: string) {
    const client = await this._getClient();
    const scopedClassName = this._scopeClassName(className);
    return client.graphql.get().withClassName(scopedClassName);
  }
}

export class LightrailKB {
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
          name: "type",
          dataType: ["text"],
        },
        {
          name: "content",
          dataType: ["text"],
        },
        {
          name: "metadata",
          dataType: ["text"],
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

  async addItems(items: LightrailKBItem[]) {
    log.silly(`Add a batch of ${items.length} items to KB...`);
    await this._setup();
    const vectorizer = await this._getVectorizer();
    const vectors: any[] = [];
    const itemsCount = items.length;

    const sortedItems = [...items].sort((a, b) =>
      a.content.length > b.content.length ? 1 : -1
    );

    const vectorizingBatchSize = 5;
    for (let i = 0; i < sortedItems.length; i += vectorizingBatchSize) {
      const batch = sortedItems.slice(i, i + vectorizingBatchSize);
      const vecs = await vectorizer.vectorize(batch.map((i) => i.content));
      vectors.push(...vecs);
    }

    let curr = 1;
    for (const item of sortedItems) {
      log.silly("Vectorizing item " + curr + "/" + itemsCount);
      curr++;
    }
    log.silly("Done vectorizing items");
    log.silly("Inserting items into vector store");
    await this._vectorStore.insertMany(
      this._className,
      sortedItems.map((i) => ({
        ...i,
        metadata: JSON.stringify(i.metadata ?? {}),
      })) as VectorStoreItem[],
      vectors as number[][]
    );
    log.silly("Done inserting items into vector store");
  }

  async query(query: string, tags?: string[]): Promise<LightrailKBItem[]> {
    await this._setup();
    const vectorizer = await this._getVectorizer();
    const [vector] = await vectorizer.vectorize([query]);
    let getter = await this._vectorStore.query(this._className);
    getter = getter
      .withNearVector({ vector: vector, distance: 0.2 })
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

const lightrailKBInstance = new LightrailKB();

export class LightrailDataStoresInterface implements LightrailDataStores {
  _track: LightrailTrack;
  kv: LightrailKVStore;
  // vector: LightrailVectorStore; // General interface for track-specific vector stores
  kb: LightrailKB; // Interface for accessing the KB, a specific vector store used by the KB track
  constructor(track: LightrailTrack) {
    this._track = track;
    this.kv = new LightrailKVStore(track);
    // this.vector = new LightrailVectorStore(track);
    this.kb = lightrailKBInstance;
  }
}
