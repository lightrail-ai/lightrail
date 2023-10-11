import { LightrailTrack } from "lightrail-sdk";
import { HumanMessage } from "langchain/schema";
import { getChangeProposal, getCodeBlocks } from "./util";

declare function require(module: string): any;

const FAILED_TO_RESPOND =
  "VSCode failed to respond, please make sure VSCode is currently running with the Lightrail Bridge extension installed & up-to-date!";

const timeout = (prom, time) =>
  Promise.race([
    prom,
    new Promise((_r, rej) =>
      setTimeout(() => rej(new Error(FAILED_TO_RESPOND)), time)
    ),
  ]);

export default {
  name: "vscode",
  tokens: [
    {
      name: "selection",
      description: "VSCode Current Selection",
      args: [],
      color: "#007ACC",
      async hydrate(handle, args, prompt) {
        let file, range, content;
        try {
          ({ file, range, content } = await timeout(
            handle.sendMessageToExternalClient(
              "vscode-client",
              "get-selection"
            ),
            3000
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
          selectedFiles = await timeout(
            handle.sendMessageToExternalClient(
              "vscode-client",
              "get-selected-files"
            ),
            3000
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
        let currentFile, range;
        try {
          currentFile = await timeout(
            handle.sendMessageToExternalClient(
              "vscode-client",
              "get-editing-file"
            ),
            3000
          );
        } catch (e) {
          throw new Error(FAILED_TO_RESPOND);
        }

        // read file contents
        const data = fs.readFileSync(currentFile, "utf8");

        const chunks = await handle.transform.toChunks(data, {
          path: currentFile,
        });

        if (chunks) {
          console.log(chunks);
          chunks.forEach((chunk) => {
            prompt.appendContextItem({
              type: "code",
              title: currentFile + ":" + chunk.from.line + "-" + chunk.to.line,
              content: chunk.content,
            });
          });
        } else {
          prompt.appendContextItem({
            type: "code",
            title: currentFile,
            content: data,
          });
        }

        prompt.appendText(currentFile);
      },
      render() {
        return [];
      },
    },
  ],
  actions: [
    {
      name: "Insert at Cursor",
      description: "Generate code at the current cursor position in VSCode",
      args: [],
      color: "#007ACC",
      icon: "pen-to-square",
      async handler(handle, prompt) {
        handle.sendMessageToRenderer("new-message", {
          sender: "user",
          content: prompt._json,
        });

        await prompt.hydrate(handle);

        let currentFile, range;
        try {
          currentFile = await timeout(
            handle.sendMessageToExternalClient(
              "vscode-client",
              "get-editing-file"
            ),
            3000
          );

          ({ range } = await timeout(
            handle.sendMessageToExternalClient(
              "vscode-client",
              "get-selection"
            ),
            3000
          ));
        } catch (e) {
          throw new Error(FAILED_TO_RESPOND);
        }

        if (
          currentFile &&
          !prompt._context.some((c) => c.title.startsWith(currentFile))
        ) {
          const fs = require("fs");

          prompt.appendContextItem({
            type: "code",
            title: currentFile,
            content: await fs.readFileSync(currentFile),
          });
        }

        prompt.appendText(
          "\n\n" +
            "Output your response as a single code block. Your response will be inserted into an existing file by the user. " +
            (currentFile ? " It will be inserted into " + currentFile : "") +
            (currentFile && range ? " at line " + range.start.line : "") +
            (currentFile ? ". " : "") +
            "Do not leave comments or symbols that indicate code before or after the code you generate -- just output the requested code. Do not output any explanation or context outside of the code block. "
        );

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

        const codeToInsert = getCodeBlocks(response.content);
        console.log(codeToInsert);

        if (codeToInsert.length > 0) {
          try {
            handle.sendMessageToExternalClient(
              "vscode-client",
              "insert-at-cursor",
              codeToInsert[0]
            );
            handle.sendMessageToRenderer(
              "new-notification",
              "Code inserted in VSCode!"
            );
          } catch (e) {
            throw new Error(FAILED_TO_RESPOND);
          }
        }
      },
    },
    {
      name: "Propose Changes",
      description: "Suggest appropriate changes in VSCode",
      args: [],
      color: "#007ACC",
      icon: "pen-to-square",
      async handler(handle, prompt) {
        handle.sendMessageToRenderer("new-message", {
          sender: "user",
          content: prompt._json,
        });

        await prompt.hydrate(handle);

        prompt.appendText(
          "\n\n" +
            'Output your response as a series of file paths (in backticks, i.e. as inline code) followed by code blocks of the updated file contents you\'d like to propose, like this: \n\n`/path/to/file1.js`\n```js\nconst x = 1;\n```\n\n`/path/to/file2.py`\n```python\nprint("Hello World")\n```\n\n' +
            "Don't output any other content in your response outside of the code blocks. Any explanation should be provided as comments only. If editing a section of a file that was provided with line-numbers, please output the line-numbers in the file path, like this: `/path/to/file1.js:1-3`. " +
            "The file might be provided to you as a series of chunks in your context. If so, only output chunks that correspond directly to chunks in the context. Do not create your own chunks or combine chunks. Output as few chunks as possible to completely fulfill the request. " +
            "Only output a codeblock/chunk if it contains changes. " +
            "To propose creation of a new file, just output the (proposed) file path and contents as above. " +
            "Do not ever skip any lines that belong in a given code block (i.e. do not use ellipses (...) or comments of any kind to indicate omitted code). "
        );

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

        if (pairs.length > 0) {
          try {
            handle.sendMessageToExternalClient(
              "vscode-client",
              "codegen-proposals",
              pairs
            );
            handle.sendMessageToRenderer(
              "new-notification",
              "Check VSCode to see the proposed changes!"
            );
          } catch (e) {
            throw new Error(FAILED_TO_RESPOND);
          }
        }
      },
    },
  ],
  handlers: {
    main: {
      "vscode-client:new-selection": async (handle) => {
        handle.sendMessageToRenderer("prioritize-token", "selection");
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
      "new-notification": async (rendererHandle, notification) => {
        rendererHandle.ui?.notify(notification);
      },
    },
  },
} satisfies LightrailTrack;
