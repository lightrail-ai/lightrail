import type {
  LightrailMainProcessHandle,
  LightrailTrack,
  PromptContextItem,
  TaskHandle,
} from "lightrail-sdk";
import type { LightrailKBItem } from "lightrail-sdk";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HumanMessage } from "langchain/schema";
import { CHUNKABLE_CODE_EXTENSIONS, chunkCode } from "../main/transforms";

let currentTask: TaskHandle | undefined;

export default <LightrailTrack>{
  name: "kb",
  actions: [
    {
      name: "Add to Knowledge Base",
      description: "Add content to your knowledge base",
      color: "#facc15",
      args: [
        {
          name: "tag",
          description: "Tag for the content",
          type: "history",
          key: "kb-tag",
        },
      ],
      icon: "lightbulb",
      async handler(mainHandle: LightrailMainProcessHandle, prompt, args) {
        const fs = require("fs/promises");
        const pdf2md = require("@opendocsg/pdf2md");
        const { join } = require("path");
        const { glob } = require("glob");
        let context: PromptContextItem[] = [];

        mainHandle.sendMessageToRenderer("start-task");

        try {
          mainHandle.sendMessageToRenderer(
            "new-notification",
            "Your content is being added to the knowledge base. This may take a while, depending on the number & size of new items - see the progress indicator below for more information."
          );

          const addFileToContext = (path: string) => {
            const ext = path.split(".").pop();
            if (!ext) return;
            if (CHUNKABLE_CODE_EXTENSIONS.includes(ext)) {
              context.push({
                title: path,
                type: "code",
                content: "",
                metadata: {
                  path,
                },
              });
            } else {
              context.push({
                title: path,
                type: "text",
                content: "",
                metadata: {
                  path,
                },
              });
            }
          };

          await prompt.hydrate(mainHandle, {
            files: {
              path: async (handle, args, prompt, origHydrate) => {
                const pathString = args.path;

                const isDirectory = (await fs.lstat(pathString)).isDirectory();
                if (isDirectory) {
                  (
                    await glob(
                      `**/*.{${[
                        ...CHUNKABLE_CODE_EXTENSIONS,
                        "md",
                        "txt",
                        "pdf",
                      ].join(",")}}`,
                      {
                        ignore: [
                          "**/node_modules/**",
                          "**/dist/**",
                          "**/track-dist/**",
                          "**/out/**",
                          "**/build/**",
                          "**/builds/**",
                          "**/package-lock.json",
                          "**/*.min.*",
                        ],
                        dot: false,
                        nodir: true,
                        cwd: pathString,
                      }
                    )
                  ).forEach((p) => {
                    addFileToContext(join(pathString, p));
                  });
                } else {
                  addFileToContext(pathString);
                }

                await origHydrate(handle, args, prompt);
              },
            },
          });

          context.push(...prompt._context);

          const splitter = RecursiveCharacterTextSplitter.fromLanguage(
            "markdown",
            {
              chunkSize: 512 * 3,
              chunkOverlap: 0,
            }
          );

          const items: LightrailKBItem[] = [];

          for (const c of context) {
            if (c.content === "" && c.metadata?.path) {
              if (c.metadata.path.endsWith(".pdf")) {
                const pdfBuffer = await fs.readFile(c.metadata.path);
                c.content = await pdf2md(pdfBuffer);
              } else {
                c.content = await fs.readFile(c.metadata.path, "utf-8");
              }
            }
            if (c.type === "code") {
              const chunks = await chunkCode(c.content, c.title);
              items.push(
                ...chunks.map((chunk) => ({
                  ...c,
                  content: chunk.extractLines(c.content).join("\n"),
                  tags: args.tag ? [args.tag] : [],
                }))
              );
            } else {
              const docs = await splitter.createDocuments([c.content]);
              items.push(
                ...docs.map((d) => ({
                  ...c,
                  content: d.pageContent,
                  metadata: { ...(c.metadata ?? {}), ...d.metadata },
                  tags: args.tag ? [args.tag] : [],
                }))
              );
            }
          }

          if (mainHandle.store.kb["_vectorizer"] === undefined) {
            mainHandle.sendMessageToRenderer("update-progress", {
              message: "Initializing vectorizer...",
              progress: [0, items.length],
            });
          } else {
            mainHandle.sendMessageToRenderer("update-progress", {
              message: `Vectorizing content (${items.length} chunks)...`,
              progress: [0, items.length],
            });
          }

          const batchSize = 30;
          for (let i = 0; i < items.length; i += batchSize) {
            const chunk = items.slice(i, i + batchSize);
            await mainHandle.store.kb.addItems(chunk);
            mainHandle.sendMessageToRenderer("update-progress", {
              message: `Vectorizing content (${items.length} chunks)...`,
              progress: [Math.min(i + batchSize, items.length), items.length],
            });
          }

          mainHandle.sendMessageToRenderer("end-task");
          mainHandle.sendMessageToRenderer(
            "new-notification",
            "Your content has successfully been added to the knowledge base!"
          );
        } catch (e) {
          mainHandle.sendMessageToRenderer("end-task");
          throw e;
        }
      },
    },
    {
      name: "Query Knowledge Base",
      description: "Ask a question and get an answer from your knowledge base",
      color: "#facc15",
      args: [
        {
          name: "tag",
          description: "Tag for the content",
          type: "history",
          key: "kb-tag",
        },
      ],
      icon: "circle-question",
      async handler(mainHandle, prompt, args) {
        mainHandle.sendMessageToRenderer("new-message", {
          sender: "user",
          content: prompt._json,
        });

        await prompt.hydrate(mainHandle);
        const str = prompt.toString();

        if (mainHandle.store.kb["_vectorizer"] === undefined) {
          mainHandle.sendMessageToRenderer(
            "new-notification",
            "Your query will run after the local vectorizer has been initialized, please wait a moment. This only needs to happen once unless Lightrail is quit."
          );
        }

        const results = await mainHandle.store.kb.query(
          str,
          args.tag ? [args.tag] : undefined
        );

        console.log(results);

        for (const r of results) {
          prompt.appendContextItem(r);
        }

        const response = await mainHandle.llm.chat.converse(
          [new HumanMessage(prompt.toString())],
          {
            callbacks: [
              {
                handleLLMNewToken: (token) =>
                  mainHandle.sendMessageToRenderer("new-token", token),
                handleLLMError: (error) => {
                  throw new Error(error.message);
                },
              },
            ],
          }
        );
        mainHandle.sendMessageToRenderer("new-message", {
          sender: "ai",
          content: response.content,
        });
      },
    },
  ],
  tokens: [
    {
      name: "relevant-content",
      description: "Relevant content from your knowledge base",
      args: [
        {
          name: "tag",
          description: "Tag for the content",
          type: "history",
          key: "kb-tag",
        },
      ],
      color: "#facc15",
      async hydrate(handle, args, prompt) {
        const str = prompt._json["content"]
          .filter((c) => c.type === "text")
          .map((c) => c.text)
          .join("");

        if (handle.store.kb["_vectorizer"] === undefined) {
          handle.sendMessageToRenderer(
            "new-notification",
            "Your query will run after the local vectorizer has been initialized, please wait a moment. This only needs to happen once unless Lightrail is quit."
          );
        }

        const results = await handle.store.kb.query(
          str,
          args.tag ? [args.tag] : undefined
        );

        for (const r of results) {
          prompt.appendContextItem(r);
        }

        prompt.appendText(" the provided context ");
      },
      render(args) {
        return [args.tag];
      },
    },
  ],
  handlers: {
    renderer: {
      "new-token": async (rendererHandle, token) =>
        rendererHandle.ui?.chat.setPartialMessage((prev) =>
          prev ? prev + token : token
        ),
      "new-message": async (rendererHandle, message) => {
        rendererHandle.ui?.chat.setPartialMessage(null);
        rendererHandle.ui?.chat.setHistory((prev) => [...prev, message]);
      },
      "new-notification": async (rendererHandle, message) => {
        rendererHandle.ui?.notify(message);
      },
      "start-task": async (rendererHandle) => {
        currentTask = rendererHandle.ui?.tasks.startTask();
        currentTask?.setMessage("Chunking content...");
      },
      "update-progress": async (
        _rendererHandle,
        { message, progress }: { message: string; progress: [number, number] }
      ) => {
        currentTask?.setMessage(message);
        currentTask?.setProgress(progress);
      },
      "end-task": async (_rendererHandle) => {
        currentTask?.finishTask();
        currentTask = undefined;
      },
    },
  },
};
