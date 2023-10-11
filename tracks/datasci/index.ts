import {
  LightrailMainProcessHandle,
  LightrailTrack,
  Prompt,
} from "lightrail-sdk";
import { timeout } from "./util";
import {
  getNotebookChangeProposal,
  isCode,
  multilineToString,
  renderJupyterNotebookOutputs,
} from "./notebook-util";
import { ICell, INotebookContent } from "@jupyterlab/nbformat";
import { HumanMessage } from "langchain/schema";

declare function require(module: string): any;

type NBCell = ICell & { raw?: string };

async function getCellsFromRmd(
  handle: LightrailMainProcessHandle,
  path: string,
  rmdContent: string
): Promise<NBCell[]> {
  const fs = require("fs/promises");
  const { Buffer } = require("node:buffer");
  let cells: NBCell[] = [];

  const rmdTokens = await handle.transform.tokenizeMarkdown(rmdContent);
  for (const token of rmdTokens) {
    if (token.type === "code") {
      cells.push({
        cell_type: "code",
        source: token.text,
        metadata: {},
        outputs: [],
        raw: token.raw,
      });
    } else if (token.type === "space") {
      cells.push({
        cell_type: "raw",
        source: token.raw,
        metadata: {},
        outputs: [],
        raw: token.raw,
      });
    } else {
      cells.push({
        cell_type: "markdown",
        source: token.raw,
        metadata: {},
        outputs: [],
        raw: token.raw,
      });
    }
  }

  console.log(JSON.stringify(cells));

  // Align outputs from preview with cells
  let previewPath = path
    .replace(".rmd", ".nb.html")
    .replace(".Rmd", ".nb.html");

  let preview: string | undefined = undefined;

  try {
    await fs.access(previewPath); // Check if preview file exists
    preview = await fs.readFile(previewPath, "utf8");
  } catch (e) {
    console.log(previewPath);
    console.log(e);
    handle.sendMessageToRenderer(
      "new-notification",
      "Preview file (.nb.html) not found for this RMarkdown file. Lightrail can still edit the file, but performance will be substantially worse since it will not be able to see outputs. If possible, please author your notebook with the html_notebook output format and make sure the (up-to-date) preview file is in the same directory."
    );
  }

  if (preview) {
    let chunks: string[] = [];
    preview = preview.slice(preview.indexOf("<body>"));
    let chunkStart = preview.indexOf("<!-- rnb-chunk-begin -->");
    while (chunkStart > -1) {
      preview = preview.slice(chunkStart);
      const chunkEnd = preview.indexOf("<!-- rnb-chunk-end -->");
      chunks.push(preview.slice(0, chunkEnd));
      preview = preview.slice(chunkEnd);
      chunkStart = preview.indexOf("<!-- rnb-chunk-begin -->");
    }

    let chunkSource, chunkOutput;

    let lastFoundChunk = 0;
    let lastUnasignedOutput = "";
    let lastUnasignedOutputSource = "";

    for (const chunk of chunks) {
      chunkSource = "";
      chunkOutput = "";
      for (const match of chunk.matchAll(
        /<!-- rnb-source-begin ([-+A-Za-z0-9/=]+) -->/g
      )) {
        const b64source = match[1];
        const data: string = JSON.parse(
          Buffer.from(b64source, "base64").toString("utf8")
        )["data"];

        chunkSource += data
          .match(/^```.*([\s\S]*)```$/m)?.[1]
          ?.replace(/\s/g, "");
      }
      for (const match of chunk.matchAll(
        /<!-- rnb-output-begin ([-+A-Za-z0-9/=]+) -->/g
      )) {
        const b64output = match[1];
        const data: string = JSON.parse(
          Buffer.from(b64output, "base64").toString("utf8")
        )["data"];
        chunkOutput += data;
      }

      console.log("\n\nSRC\n\n" + chunkSource);
      console.log("\n\nOUT\n\n" + chunkOutput);

      const cellIndex = cells.findIndex(
        (cell) => (cell.source as string).replace(/\s/g, "") === chunkSource
      );

      if (cellIndex > -1) {
        const cell = cells[cellIndex];
        lastFoundChunk = cellIndex;

        if (chunkOutput) {
          cell.outputs = [
            {
              output_type: "stream",
              text: chunkOutput,
            },
          ];
        }
      } else if (chunkOutput !== "" && chunkSource !== "") {
        lastUnasignedOutput = chunkOutput;
        lastUnasignedOutputSource = chunkSource;
      }
    }

    // Assign output in case of an error that halted execution
    if (lastUnasignedOutput !== "" && lastUnasignedOutputSource !== "") {
      const cell = cells
        .slice(lastFoundChunk)
        .find((cell) =>
          (cell.source as string)
            .replace(/\s/g, "")
            .startsWith(lastUnasignedOutputSource)
        );
      if (cell) {
        cell.outputs = [
          {
            output_type: "stream",
            text: lastUnasignedOutput,
          },
        ];
      }
    }
  }

  return cells;
}

function getFormatAndLanguage(path): [string, string] {
  if (path.toLowerCase().endsWith(".ipynb")) {
    return ["ipynb", "python"];
  } else if (path.toLowerCase().endsWith(".rmd")) {
    return ["rmd", "r"];
  } else {
    throw new Error(
      "Unsupported file format: Notebook must be either .ipynb (jupyter) or .Rmd (RMarkdown)"
    );
  }
}

interface CellDiff {
  type: "code" | "markdown";
  old: string | undefined;
  new: string | undefined;
}

async function editNotebookWithLLM(
  handle: LightrailMainProcessHandle,
  prompt: Prompt,
  path: string
) {
  const fs = require("fs/promises");
  const Diff = require("diff");
  let [format, language] = getFormatAndLanguage(path);

  let notebook: INotebookContent | undefined = undefined;
  let cells: NBCell[] = [];
  // Get Cells
  const data = await fs.readFile(path, "utf8");
  let rmdHeader: string = "";

  if (format === "ipynb") {
    notebook = JSON.parse(data) as INotebookContent;
    cells = notebook.cells;
  } else if (format === "rmd") {
    rmdHeader = data.match(/^---[\s\S]*---\s*/)?.[0] ?? "";
    const rmdContent = data.slice(rmdHeader.length);
    cells = await getCellsFromRmd(handle, path, rmdContent);
  }

  let cellIndexMap: { [newIndex: number]: number } = {};
  let editableCells: ICell[] = [];

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
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
          ? renderJupyterNotebookOutputs(cell.outputs)
          : null;
        return `
      [${i}]
      \`\`\`${isCode(cell) ? language : "markdown"}
      ${multilineToString(cell.source)}
      \`\`\`${output ? "\n[Output]:\n```\n" + output + "\n```" : ""}`;
      })

      .join("\n\n"),
  });

  prompt.appendText(
    `\n\nTo propose changes to the notebook, output a series of pairs of cell number (in brackets) followed by a code block of the updated cell contents you'd like to propose, like this: \n\n[1]\n\`\`\`markdown\n# Print out result\n\`\`\`\n\n[3]\n\`\`\`${language}\nprint(table)\n\`\`\`\n\n` +
      "Do not output any other content in your response outside of the code blocks. Any explanation should be provided as comments only. " +
      "Only output codeblocks for cells that you want to change. To propose creation of a new cell, just output the (proposed) cell number and contents as above. " +
      "To insert a cell between two existing cells, use the cell number of the preceding cell plus 0.5, e.g. to insert between 2 and 3, output a cell with cell number [2.5]. Multiple cells with an x.5 cell number will be inserted in the order you propose them. " +
      `Make sure that the codeblocks for markdown cells use the language hint 'markdown' and that the codeblocks for code cells use the language hint '${language}' as appropriate. ` +
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

  const proposal = getNotebookChangeProposal(
    handle.transform.tokenizeMarkdown(response.content)
  );

  const newCells: { [index: number]: ICell } = {};
  cells.forEach((cell, i) => (newCells[i] = cell));

  const diffs: CellDiff[] = [];

  for (const [cellIndex, { cellType, content }] of proposal) {
    let mappedIndex = cellIndexMap[cellIndex];
    const raw =
      cellType === "markdown"
        ? content
        : `\`\`\`{${language}}\n${content}\n\`\`\``;
    if (mappedIndex !== undefined) {
      const oldSource = multilineToString(newCells[mappedIndex].source);
      if (oldSource !== content) {
        diffs.push({
          type: cellType,
          old: oldSource,
          new: content,
        });
      }
      newCells[mappedIndex] = {
        cell_type: cellType,
        source: content.split("\n"),
        raw,
        metadata: {},
        outputs: [],
      };
    } else if (cellIndexMap[Math.floor(cellIndex)] !== undefined) {
      mappedIndex = cellIndexMap[Math.floor(cellIndex)] + (cellIndex % 1);
      diffs.push({
        type: cellType,
        old: undefined,
        new: content,
      });
      newCells[mappedIndex] = {
        cell_type: cellType,
        source: content.split("\n"),
        raw,
        metadata: {},
        outputs: [],
      };
    } else {
      diffs.push({
        type: cellType,
        old: undefined,
        new: content,
      });
      newCells[cellIndex + cells.length] = {
        cell_type: cellType,
        source: content.split("\n"),
        raw,
        metadata: {},
        outputs: [],
      };
    }
  }

  mainProcessState.previousContents = data;
  mainProcessState.previousContentsPath = path;

  if (format === "ipynb" && notebook) {
    notebook.cells = Object.entries(newCells)
      .sort(([indexA, _a], [indexB, _b]) => Number(indexA) - Number(indexB))
      .map(([_, cell]) => cell);

    await fs.writeFile(path, JSON.stringify(notebook));
  } else if (format === "rmd") {
    const newRmdContent = Object.entries(newCells)
      .sort(([indexA, _a], [indexB, _b]) => Number(indexA) - Number(indexB))
      .map(([_, cell]) =>
        isCode(cell) ? `START` + cell.raw + "END" : cell.raw
      )
      .join("")
      .replace(/([^\n])START```/g, "$1\n```")
      .replace(/```END([^\n])/g, "```\n$1")
      .replace(/```END/g, "```")
      .replace(/START```/g, "```");

    await fs.writeFile(path, rmdHeader + newRmdContent);
  }

  console.log(diffs);

  handle.sendMessageToRenderer("new-message", {
    sender: "ai",
    content:
      "### Edits Made:\n\n\n" +
      diffs
        .map((d) => {
          const diff = Diff.createTwoFilesPatch(
            undefined,
            undefined,
            d.old ? d.old.trim() + "\n" : "\n",
            d.new ? d.new.trim() + "\n" : "\n",
            undefined,
            undefined,
            {
              context: 10000,
            }
          );
          const trimmedDiff = diff.slice(diff.indexOf("@@\n") + 3);
          return `\`\`\`diff\n${trimmedDiff}\`\`\``;
        })
        .join("\n\n\n"),
  });
}

let mainProcessState: {
  previousContents: string | undefined;
  previousContentsPath: string | undefined;
} = {
  previousContents: undefined,
  previousContentsPath: undefined,
};

export default {
  name: "data-sci",
  tokens: [
    // {
    //   name: "csv",
    // },
    {
      name: "notebook",
      args: [
        {
          type: "path",
          name: "path",
          description: "Path to a .ipynb or .Rmd file",
        },
      ],
      color: "#ad0836",
      description: "Reference a Jupyter or RMarkdown Notebook",
      async hydrate(handle, args, prompt) {
        const fs = require("fs/promises");
        const { path } = args;
        let [format, language] = getFormatAndLanguage(path);

        let cells: NBCell[] = [];

        const data = await fs.readFile(path, "utf8");
        let rmdHeader: string = "";

        if (format === "ipynb") {
          const notebook = JSON.parse(data) as INotebookContent;
          cells = notebook.cells;
        } else if (format === "rmd") {
          rmdHeader = data.match(/^---[\s\S]*---\s*/)?.[0] ?? "";
          const rmdContent = data.slice(rmdHeader.length);
          cells = await getCellsFromRmd(handle, path, rmdContent);
        }

        let editableCells = cells.filter(
          (c) => isCode(c) || c.cell_type === "markdown"
        );

        console.log(editableCells.map((cell) => JSON.stringify(cell.outputs)));
        const title = "the notebook at " + path;

        prompt.appendContextItem({
          type: "text",
          title,
          content: editableCells
            .map((cell, i) => {
              const output = isCode(cell)
                ? renderJupyterNotebookOutputs(cell.outputs)
                : null;
              return `
[${i}]
\`\`\`${isCode(cell) ? language : "markdown"}
${multilineToString(cell.source)}
\`\`\`${output ? "\n[Output]:\n```\n" + output + "\n```" : ""}`;
            })
            .join("\n\n"),
        });

        console.log(
          "\n\n\n\n\n\n________________________________________\n\n\n\n\n\n"
        );
        console.log(prompt._context[0].content);
        console.log(
          "\n\n\n\n\n\n________________________________________\n\n\n\n\n\n"
        );

        prompt.appendText(title);
      },
      render(args) {
        return [args.path];
      },
    },
  ],
  actions: [
    {
      name: "Edit Current VSCode Notebook",
      description: "Edit a Jupyter Notebook in VSCode",
      args: [],
      color: "#ad0836",
      icon: "newspaper",
      placeholder: "Describe the change(s) you'd like to make",
      async handler(handle, prompt) {
        const VSCODE_FAILED_TO_RESPOND =
          "VSCode failed to respond, please make sure VSCode is currently running with the Lightrail Bridge extension installed & up-to-date!";

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
          throw new Error(VSCODE_FAILED_TO_RESPOND);
        }

        if (!currentFile || !currentFile.endsWith(".ipynb")) {
          throw new Error(
            "This action only supports editing Jupyter Notebooks in VSCode. Make sure a Notebook is open in VSCode (with the latest version of Lighrail Bridge installed) and try again."
          );
        }

        await editNotebookWithLLM(handle, prompt, currentFile);
        if (mainProcessState.previousContents !== undefined) {
          handle.sendMessageToRenderer("show-revert-button");
          try {
            await timeout(
              handle.sendMessageToExternalClient(
                "vscode-client",
                "refresh-notebook-from-disk",
                currentFile
              ),
              3000
            );

            handle.sendMessageToRenderer(
              "new-notification",
              "Check VSCode to see the proposed changes!"
            );
          } catch (e) {
            throw new Error(VSCODE_FAILED_TO_RESPOND);
          }
        }
      },
    },
    {
      name: "Edit Notebook",
      description: "Edit a Jupyter Notebook in VSCode",
      args: [
        {
          type: "path",
          name: "path",
          description: "Path to a .ipynb or .Rmd file",
        },
      ],
      color: "#ad0836",
      icon: "newspaper",
      placeholder: "Describe the change(s) you'd like to make",
      async handler(handle, prompt, args) {
        handle.sendMessageToRenderer("new-message", {
          sender: "user",
          content: prompt._json,
        });

        prompt.appendText(
          `\n\nPlease edit The Current Notebook (see context above) to comply with the following request:\n\n`
        );

        await prompt.hydrate(handle);

        const path = args.path;

        if (!path && !(path.endsWith(".ipynb") || path.endsWith(".Rmd"))) {
          throw new Error(
            "This action only supports editing Jupyter or Rmd notebooks. Please provide a path to an appropriate notebook file and try again."
          );
        }

        await editNotebookWithLLM(handle, prompt, path);

        if (mainProcessState.previousContents !== undefined) {
          handle.sendMessageToRenderer("new-notification", "File updated!");
          handle.sendMessageToRenderer("show-revert-button");
        }
      },
    },
  ],
  handlers: {
    main: {
      "revert-notebook": async (handle) => {
        const fs = require("fs/promises");
        if (mainProcessState.previousContents !== undefined) {
          try {
            await fs.writeFile(
              mainProcessState.previousContentsPath,
              mainProcessState.previousContents
            );
            handle.sendMessageToRenderer("new-notification", "File reverted!");
            mainProcessState.previousContents = undefined;
            mainProcessState.previousContentsPath = undefined;
          } catch (e) {
            handle.sendMessageToRenderer(
              "new-notification",
              "Failed to revert file!"
            );
          }
        }
      },
    },
    renderer: {
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
      "show-revert-button": async (rendererHandle) => {
        rendererHandle.ui?.controls.setControls([
          {
            type: "buttons",
            buttons: [
              {
                label: "Undo Edits",
                color: "primary",
                onClick: () => {
                  rendererHandle.sendMessageToMain("revert-notebook");
                  rendererHandle.ui?.controls.setControls([]);
                },
              },
              {
                label: "Keep",
                onClick: () => {
                  rendererHandle.ui?.controls.setControls([]);
                },
              },
            ],
          },
        ]);
      },
    },
  },
} satisfies LightrailTrack;
