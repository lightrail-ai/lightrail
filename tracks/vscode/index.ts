import { LightrailTrack } from "lightrail-sdk";
import { HumanMessage } from "langchain/schema";
import {
  getChangeProposal,
  getCodeBlocks,
  getNotebookChangeProposal,
} from "./util";
import {
  type ICodeCell,
  type ICell,
  type INotebookContent,
  type IOutput,
  type MultilineString,
  type IExecuteResult,
  type IDisplayData,
  type IDisplayUpdate,
  type IStream,
  type IError,
} from "@jupyterlab/nbformat";

declare function require(module: string): any;

function isCode(cell: ICell): cell is ICodeCell {
  return cell.cell_type === "code";
}
export function isExecuteResult(output: IOutput): output is IExecuteResult {
  return output.output_type === "execute_result";
}

/**
 * Test whether an output is from display data.
 */
export function isDisplayData(output: IOutput): output is IDisplayData {
  return output.output_type === "display_data";
}

/**
 * Test whether an output is from updated display data.
 */
export function isDisplayUpdate(output: IOutput): output is IDisplayUpdate {
  return output.output_type === "update_display_data";
}

/**
 * Test whether an output is from a stream.
 */
export function isStream(output: IOutput): output is IStream {
  return output.output_type === "stream";
}

/**
 * Test whether an output is an error.
 */
export function isError(output: IOutput): output is IError {
  return output.output_type === "error";
}

const FAILED_TO_RESPOND =
  "VSCode failed to respond, please make sure VSCode is currently running with the Lightrail Bridge extension installed & up-to-date!";

const timeout = (prom, time) =>
  Promise.race([
    prom,
    new Promise((_r, rej) =>
      setTimeout(() => rej(new Error(FAILED_TO_RESPOND)), time)
    ),
  ]);

const multilineToString = (str: MultilineString) =>
  typeof str === "string" ? str : str.join("\n");

function renderNotebookOutputs(outputs: IOutput[]): string | void {
  for (const o of outputs) {
    if (isStream(o)) {
      return multilineToString(o.text);
    } else if (isError(o)) {
      return (
        "ERROR: " + o.ename + "\n" + o.evalue + "\n" + o.traceback.join("\n")
      );
    } else if (isExecuteResult(o) || isDisplayData(o)) {
      if (o.data["text/plain"]) {
        return multilineToString(o.data["text/plain"] as MultilineString);
      } else if (o.data["text/html"]) {
        return multilineToString(o.data["text/html"] as MultilineString);
      } else if (o.data["text/markdown"]) {
        return multilineToString(o.data["text/markdown"] as MultilineString);
      }
    }
  }
}

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
      name: "Edit Current Notebook",
      description: "Edit a Jupyter Notebook in VSCode",
      args: [],
      color: "#007ACC",
      icon: "newspaper",
      placeholder: "Describe the change(s) you'd like to make",
      async handler(handle, prompt) {
        let currentFile: string;

        handle.sendMessageToRenderer("new-message", {
          sender: "user",
          content: prompt._json,
        });

        prompt.appendText(
          `\n\nPlease edit The Current Notebook (see context above) to comply with the following request:\n\n`
        );

        await prompt.hydrate(handle, {
          vscode: {
            "current-file": async () => {}, // Ignore if token is used
          },
        });

        try {
          currentFile = await timeout(
            handle.sendMessageToExternalClient(
              "vscode-client",
              "get-active-notebook"
            ),
            3000
          );
        } catch (e) {
          throw new Error(FAILED_TO_RESPOND);
        }

        if (!currentFile || !currentFile.endsWith(".ipynb")) {
          throw new Error(
            "This action only supports editing Jupyter Notebooks. Make sure a Notebook is open in VSCode (with the latest version of Lighrail Bridge installed) and try again."
          );
        }

        const fs = require("fs/promises");

        // read file contents
        const data = await fs.readFile(currentFile, "utf8");
        const notebook = JSON.parse(data) as INotebookContent;

        let cellIndexMap: { [newIndex: number]: number } = {};
        let editableCells: ICell[] = [];

        for (let i = 0; i < notebook.cells.length; i++) {
          const cell = notebook.cells[i];
          if (isCode(cell) || cell.cell_type === "markdown") {
            cellIndexMap[editableCells.length] = i;
            editableCells.push(cell);
          }
        }

        console.log(editableCells.map((cell) => JSON.stringify(cell.outputs)));

        prompt.appendContextItem({
          type: "text",
          title: "The Current Notebook",
          content: editableCells
            .map((cell, i) => {
              const output = isCode(cell)
                ? renderNotebookOutputs(cell.outputs)
                : null;
              return `
            [${i}]
            \`\`\`${isCode(cell) ? "python" : "markdown"}
            ${multilineToString(cell.source)}
            \`\`\`${output ? "\n[Output]:\n```\n" + output + "\n```" : ""}`;
            })

            .join("\n\n"),
        });

        prompt.appendText(
          `\n\nTo propose changes to the notebook, output a series of pairs of cell number (in brackets) followed by a code block of the updated cell contents you'd like to propose, like this: \n\n[1]\n\`\`\`markdown\n# Print out result\n\`\`\`\n\n[3]\n\`\`\`python\nprint(table)\n\`\`\`\n\n` +
            "Do not output any other content in your response outside of the code blocks. Any explanation should be provided as comments only. " +
            "Only output codeblocks for cells that you want to change. To propose creation of a new cell, just output the (proposed) cell number and contents as above. " +
            "To insert a cell between two existing cells, use the cell number of the preceding cell plus 0.5, e.g. to insert between 2 and 3, output a cell with cell number [2.5]. Multiple cells with an x.5 cell number will be inserted in the order you propose them. " +
            "Make sure that the codeblocks for markdown cells use the language hint 'markdown' and that the codeblocks for code cells use the language hint 'python' as appropriate. " +
            "Try to make sure each cell is a logical unit, and separate cells cleanly as required for good structure. ONLY output cell numbers followed by cells, nothing else!"
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

        const proposal = getNotebookChangeProposal(response.content);

        const newCells: { [index: number]: ICell } = {};
        notebook.cells.forEach((cell, i) => (newCells[i] = cell));

        for (const [cellIndex, { cellType, content }] of proposal) {
          let mappedIndex = cellIndexMap[cellIndex];
          if (mappedIndex) {
            newCells[mappedIndex] = {
              cell_type: cellType,
              source: content.split("\n"),
              metadata: {},
              outputs: [],
            };
          } else if (cellIndexMap[Math.floor(cellIndex)]) {
            mappedIndex = cellIndexMap[Math.floor(cellIndex)] + (cellIndex % 1);
            newCells[mappedIndex] = {
              cell_type: cellType,
              source: content.split("\n"),
              metadata: {},
              outputs: [],
            };
          } else {
            newCells[cellIndex + notebook.cells.length] = {
              cell_type: cellType,
              source: content.split("\n"),
              metadata: {},
              outputs: [],
            };
          }
        }

        notebook.cells = Object.entries(newCells)
          .sort(([indexA, _a], [indexB, _b]) => Number(indexA) - Number(indexB))
          .map(([_, cell]) => cell);

        await fs.writeFile(currentFile, JSON.stringify(notebook));

        try {
          await timeout(
            handle.sendMessageToExternalClient(
              "vscode-client",
              "refresh-notebook-from-disk",
              currentFile
            ),
            3000
          );
        } catch (e) {
          throw new Error(FAILED_TO_RESPOND);
        }
      },
    },
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
