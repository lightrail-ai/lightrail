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
        // const pdf2md = require("@opendocsg/pdf2md");
        // const { join } = require("path");
        // let context: PromptContextItem[] = [];

        mainHandle.sendMessageToRenderer("start-task");

        try {
          mainHandle.sendMessageToRenderer(
            "new-notification",
            "Your content is being added to the knowledge base. This may take a while, depending on the number & size of new items - see the progress indicator below for more information."
          );

          await prompt.hydrate(mainHandle, {
            files: {
              path: async (handle, args, prompt, origHydrate) => {
                prompt.appendContextItem({
                  content: "",
                  title: args.path,
                  type: "text",
                });
              },
            },
          });

          for (let contextItem of prompt._context) {
            if (contextItem.title.startsWith("/")) {
              const path = contextItem.title;
              const isDirectory = (await fs.lstat(path)).isDirectory();
              await mainHandle.store.kb.addSource(
                {
                  frequency: "daily",
                  tags: args.tag ? [args.tag] : [],
                  uri: `file://${path}`,
                  recursive: isDirectory,
                },
                {
                  onProgress({ message, progress }) {
                    mainHandle.sendMessageToRenderer("update-progress", {
                      message,
                      progress,
                    });
                  },
                }
              );
            }

            if (contextItem.title.startsWith("http")) {
              const uri = contextItem.title;
              await mainHandle.store.kb.addSource(
                {
                  frequency: "daily",
                  tags: args.tag ? [args.tag] : [],
                  uri,
                  recursive: true,
                },
                {
                  onProgress({ message, progress }) {
                    mainHandle.sendMessageToRenderer("update-progress", {
                      message,
                      progress,
                    });
                  },
                }
              );
            }
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
        currentTask?.setMessage("Loading documents...");
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
