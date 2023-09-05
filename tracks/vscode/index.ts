import { LightrailTrack } from "lightrail-sdk";
import { HumanMessage } from "langchain/schema";
import { getChangeProposal } from "./util";

declare function require(module: string): any;

const FAILED_TO_RESPOND =
  "VSCode client failed to respond. Is VSCode running with the Lightrail extension installed?";

export default {
  name: "vscode", // Everything except name is optional
  tokens: [
    {
      name: "selection",
      description: "VSCode Current Selection",
      args: [],
      color: "#007ACC",
      async hydrate(handle, args, prompt) {
        let file, range, content;
        try {
          ({ file, range, content } = await handle.sendMessageToExternalClient(
            "vscode-client",
            "get-selection"
          ));
        } catch (e) {
          throw new Error(FAILED_TO_RESPOND);
        }

        const contextTitle =
          file + ":" + range.start.line + "-" + range.end.line;
        prompt.appendContextItem({
          type: "code",
          title: contextTitle,
          content: content,
        });
        prompt.appendText(contextTitle);
      },
      render() {
        return [];
      },
    },
    {
      name: "selected-files",
      description: "VSCode Selected Files",
      args: [],
      color: "#007ACC",
      async hydrate(handle, args, prompt) {
        let selectedFiles;
        try {
          selectedFiles = await handle.sendMessageToExternalClient(
            "vscode-client",
            "get-selected-files"
          );
        } catch (e) {
          throw new Error(FAILED_TO_RESPOND);
        }

        const fs = require("fs");

        // read file contents
        selectedFiles.forEach((path) => {
          const data = fs.readFileSync(path, "utf8");
          prompt.appendContextItem({
            type: "code",
            title: path,
            content: data,
          });
        });

        prompt.appendText(
          `the following files: [ ${selectedFiles.join(", ")} ]`
        );
      },
      render() {
        return [];
      },
    },
    {
      name: "current-file",
      description: "VSCode Current File",
      args: [],
      color: "#007ACC",
      async hydrate(handle, args, prompt) {
        const fs = require("fs");
        let currentFile;
        try {
          currentFile = await handle.sendMessageToExternalClient(
            "vscode-client",
            "get-editing-file"
          );
        } catch (e) {
          throw new Error(FAILED_TO_RESPOND);
        }

        // read file contents
        const data = fs.readFileSync(currentFile, "utf8");

        prompt.appendContextItem({
          type: "code",
          title: currentFile,
          content: data,
        });

        prompt.appendText(currentFile);
      },
      render() {
        return [];
      },
    },
  ],
  actions: [
    {
      name: "Propose Changes",
      description: "Suggest appropriate changes in VSCode",
      args: [],
      color: "#007ACC",
      icon: "window-maximize",
      async handler(handle, prompt) {
        handle.sendMessageToRenderer("new-message", {
          sender: "user",
          content: prompt._json,
        });

        prompt.appendText(
          "\n\n" +
            'Output your response as a series of file paths (in backticks, i.e. as inline code) followed by code blocks of the updated file contents you\'d like to propose, like this: \n\n`/path/to/file1.js`\n```js\nconst x = 1;\n```\n\n`/path/to/file2.py`\n```python\nprint("Hello World")\n```\n\n' +
            "Don't output any other content in your response. If editing a section of a file that was provided with line-numbers, please output the line-numbers in the file path, like this: `/path/to/file1.js:1-3`. " +
            "Do not use line-numbers unless they were provided in the original context entry. " +
            "To propose creation of a new file, just output the file path and contents as above. " +
            "Make sure you do not skip any lines in your output"
        );

        await prompt.hydrate(handle);

        const response = await handle.llm.chat.converse(
          [new HumanMessage(prompt.toString())],
          {
            callbacks: [
              {
                handleLLMNewToken: (token) =>
                  handle.sendMessageToRenderer("new-token", token),
                handleLLMError: (error) => {
                  throw new Error(error.message);
                },
              },
            ],
          }
        );

        handle.sendMessageToRenderer("new-message", {
          sender: "ai",
          content: response.content,
        });

        const proposedContent = getChangeProposal(response.content);
        console.log(proposedContent);

        const tempFiles = await Promise.all(
          proposedContent.map(([path, content]) =>
            handle.fs.writeTempFile(content, path)
          )
        );

        const pairs = proposedContent.map(([path, _content], i) => [
          path,
          tempFiles[i],
        ]);

        try {
          handle.sendMessageToExternalClient(
            "vscode-client",
            "codegen-proposals",
            pairs
          );
        } catch (e) {
          throw new Error(FAILED_TO_RESPOND);
        }
      },
    },
  ],
  handlers: {
    main: {
      "vscode-client:new-selection": async (handle) => {
        handle.sendMessageToRenderer("prioritize-token", "vscode-selection");
      },
    },
    renderer: {
      "prioritize-token": async (rendererHandle, tokenName) => {
        rendererHandle.getTokenByName(tokenName)?.prioritize();
      },
      "new-token": async (rendererHandle, token) =>
        rendererHandle.ui?.chat.setPartialMessage((prev) =>
          prev ? prev + token : token
        ),
      "new-message": async (rendererHandle, message) => {
        rendererHandle.ui?.chat.setPartialMessage(null);
        rendererHandle.ui?.chat.setHistory((prev) => [...prev, message]);
      },
    },
  },
} satisfies LightrailTrack;
