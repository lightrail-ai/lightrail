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
import type { LightrailMainProcessHandle } from "lightrail-sdk";

export function isCode(cell: ICell): cell is ICodeCell {
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

export const multilineToString = (str: MultilineString) =>
  typeof str === "string" ? str : str.join("\n");

export function renderJupyterNotebookOutputs(
  outputs: IOutput[]
): string | void {
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

type TokensList = ReturnType<
  LightrailMainProcessHandle["transform"]["tokenizeMarkdown"]
>;

export function getNotebookChangeProposal(
  tokens: TokensList
): [cell: number, value: { cellType: "code" | "markdown"; content: string }][] {
  // Tokenize the llmOutput using the marked package
  console.log(tokens);

  const proposal: [
    number,
    { cellType: "code" | "markdown"; content: string }
  ][] = [];

  // Iterate through the tokens
  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i];

    // Check if the token is of type 'paragraph'
    if (token.type === "paragraph") {
      const trimmedText = token.text.trim();
      const nextToken = tokens.slice(i + 1).find((t) => t.type !== "space");
      // Check if the trimmed text starts and ends with backticks (`) and does not contain newline characters
      if (
        /^\[[0-9]+(\.[0-9])*\]$/.test(trimmedText) &&
        nextToken?.type === "code"
      ) {
        let cellNumber = Number(trimmedText.slice(1, -1));
        // Get the fileContent from the nextToken
        let fileContent = nextToken.text.trim();
        // If a lineNumberRange is provided, replace the corresponding lines in the original fileContent
        proposal.push([
          cellNumber,
          {
            cellType: nextToken.lang === "markdown" ? "markdown" : "code",
            content: fileContent,
          },
        ]);
      }
    }
  }

  return proposal;
}
