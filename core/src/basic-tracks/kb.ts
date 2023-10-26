import type {
  LightrailKBDocument,
  LightrailMainProcessHandle,
  LightrailTrack,
  TaskHandle,
} from "lightrail-sdk";
import { HumanMessage } from "langchain/schema";

let currentTask: TaskHandle | undefined;

const timeout = (prom, time) =>
  Promise.race([
    prom,
    new Promise((_r, rej) => setTimeout(() => rej(new Error()), time)),
  ]);

interface sourceSpec {
  uri: string;
  recursive: boolean | undefined;
}

interface documentSpec {
  title: string;
  content: string;
}

async function attemptToAddToKB(
  mainHandle: LightrailMainProcessHandle,
  sourceSpecs: sourceSpec[],
  documentSpecs: documentSpec[],
  tags: string[]
) {
  try {
    for (let spec of sourceSpecs) {
      if (spec.recursive === undefined) {
        mainHandle.sendMessageToRenderer("clarify-recursiveness", [
          sourceSpecs,
          documentSpecs,
          tags,
        ]);
        return;
      }
    }

    mainHandle.sendMessageToRenderer("start-task");
    for (let spec of sourceSpecs) {
      await mainHandle.store.kb.addSource(
        {
          frequency: "daily",
          tags,
          uri: spec.uri,
          recursive: !!spec.recursive,
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

    for (let doc of documentSpecs) {
      await mainHandle.store.kb.addDocument(
        {
          tags,
          title: doc.title,
          type: "text",
          uri: "",
        },
        doc.content
      );
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
}

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

        try {
          mainHandle.sendMessageToRenderer(
            "new-notification",
            "Your content is being added to the knowledge base. This may take a while, depending on the number & size of new items - see the progress indicator below for more information."
          );

          await prompt.hydrate(mainHandle, {
            files: {
              path: async (handle, args, prompt, _origHydrate) => {
                prompt.appendContextItem({
                  content: "",
                  title: args.path,
                  type: "text",
                });
              },
            },
            vscode: {
              "selected-files": async (handle, args, prompt, _origHydrate) => {
                try {
                  const selectedFiles = await timeout(
                    handle.sendMessageToExternalClient(
                      "vscode-client",
                      "get-selected-files"
                    ),
                    3000
                  );
                  // read file contents
                  selectedFiles.forEach((path) => {
                    prompt.appendContextItem({
                      type: "code",
                      title: path,
                      content: "",
                    });
                  });
                } catch (e) {
                  throw new Error(
                    "VSCode failed to respond, please make sure VSCode is currently running with the Lightrail Bridge extension installed & up-to-date!"
                  );
                }
              },
            },
          });

          let documentSpecs: documentSpec[] = [];
          let sourceURIs: string[] = [];
          prompt._context.forEach((c) => {
            if (c.title.startsWith("/") || c.title.startsWith("http")) {
              sourceURIs.push(c.title.replace(/:[-0-9]+$/, ""));
            } else if (c.content) {
              documentSpecs.push({
                title: c.title + "(saved)",
                content: c.content,
              });
            }
          });

          sourceURIs = [...new Set(sourceURIs)];

          let sourceSpecs: sourceSpec[] = [];

          for (const uri of sourceURIs) {
            if (uri.startsWith("/")) {
              const path = uri;
              const isDirectory = (await fs.lstat(path)).isDirectory();
              sourceSpecs.push({
                uri: `file://${path}`,
                recursive: isDirectory,
              });
            } else if (uri.startsWith("http")) {
              sourceSpecs.push({
                uri,
                recursive: uri.endsWith(".pdf") ? false : undefined,
              });
            }
          }

          if (
            prompt._json["content"].length === 1 &&
            prompt._json["content"][0].type === "text"
          ) {
            documentSpecs.push({
              title: "Saved note",
              content: prompt._json["content"][0].text,
            });
          }

          if (sourceSpecs.length === 0 && documentSpecs.length === 0) {
            throw new Error(
              "Lightrail wasn't able to add anything from your prompt to the knowledge base. Try using tokens such as /file.path or /chrome.current-page."
            );
          }

          await attemptToAddToKB(
            mainHandle,
            sourceSpecs,
            documentSpecs,
            args.tag ? [args.tag] : []
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
      "clarify-recursiveness": async (
        rendererHandle,
        [sourceSpecs, documentSpecs, tags]: [
          sourceSpec[],
          documentSpec[],
          string[]
        ]
      ) => {
        const firstUnclearSourceIndex = sourceSpecs.findIndex(
          (s) => s.recursive === undefined
        );
        if (firstUnclearSourceIndex >= 0) {
          rendererHandle.ui?.controls.setControls([
            {
              type: "buttons",
              label: `For ${sourceSpecs[firstUnclearSourceIndex].uri}, recursively add linked pages to Knowledge Base?`,
              buttons: [
                {
                  label: "URL + Linked Pages",
                  onClick: () => {
                    rendererHandle.ui?.controls.setControls([]);
                    sourceSpecs[firstUnclearSourceIndex].recursive = true;
                    rendererHandle.sendMessageToMain("attempt-to-add-to-kb", [
                      sourceSpecs,
                      documentSpecs,
                      tags,
                    ]);
                  },
                },
                {
                  label: "URL Only",
                  onClick: () => {
                    rendererHandle.ui?.controls.setControls([]);
                    sourceSpecs[firstUnclearSourceIndex].recursive = false;
                    rendererHandle.sendMessageToMain("attempt-to-add-to-kb", [
                      sourceSpecs,
                      documentSpecs,
                      tags,
                    ]);
                  },
                },
              ],
            },
          ]);
        } else {
          rendererHandle.sendMessageToMain("attempt-to-add-to-kb", [
            sourceSpecs,
            documentSpecs,
            tags,
          ]);
        }
      },
    },
    main: {
      "attempt-to-add-to-kb": async (
        mainHandle,
        [sourceSpecs, documentSpecs, tags]
      ) => {
        await attemptToAddToKB(mainHandle, sourceSpecs, documentSpecs, tags);
      },
    },
  },
};
