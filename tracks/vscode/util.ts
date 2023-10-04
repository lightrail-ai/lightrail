import { Tokens, marked } from "marked";

declare function require(module: string): any;

interface ListNode {
  // the line text
  value: string;
  // reference to next line in linked list
  next: ListNode | null;
}

interface FileStorage {
  // array to hold line references by their indices
  lineArray: ListNode[];
  // linked list to hold lines in their natural order
  lineLinkedList: ListNode;
}

class FileAsLinkedListArray {
  // the FileStorage attribute for the class
  private storage: FileStorage;

  constructor(fileContents: string) {
    // Split lines by newline and map them to the list node
    let lines = fileContents.split(/\r?\n/);
    let nodeList = lines.map((line) => {
      return { value: line, next: null } as ListNode;
    });
    nodeList.forEach((node, index) => {
      node.next = index < nodeList.length - 1 ? nodeList[index + 1] : null;
    });

    this.storage = {
      lineArray: nodeList,
      lineLinkedList: nodeList[0],
    };
  }

  // method to replace sections of lines with other lines
  replaceLines(start: number, _end: number, newContent: string): void {
    let end = _end + 1;
    let newLines = newContent.split(/\r?\n/);
    let newNodes = newLines.map((line) => {
      return { value: line, next: null } as ListNode;
    });
    newNodes.forEach((node, index) => {
      node.next = index < newNodes.length - 1 ? newNodes[index + 1] : null;
    });

    if (start > 0) {
      this.storage.lineArray[start - 1].next = newNodes[0];
      this.storage.lineArray[start] = newNodes[0];
    } else {
      this.storage.lineArray[0] = newNodes[0];
    }

    if (end < this.storage.lineArray.length) {
      newNodes[newNodes.length - 1].next = this.storage.lineArray[end];
      this.storage.lineArray[end - 1] = newNodes[newNodes.length - 1];
    }

    let headPart = this.storage.lineArray.slice(0, start);
    let tailPart = this.storage.lineArray.slice(end);

    const newLineArray = [...headPart, ...newNodes, ...tailPart];
    this.storage.lineLinkedList = newLineArray[0];
  }

  // method to render the file to a string using the linked list
  renderToString(): string {
    let output: string[] = [];
    let node: ListNode | null = this.storage.lineLinkedList;
    while (node) {
      output.push(node.value);
      node = node.next;
    }
    return output.join("\n");
  }
}

export function getChangeProposal(llmOutput: string): Array<[string, string]> {
  // Tokenize the llmOutput using the marked package
  const tokens = marked.lexer(llmOutput);
  console.log(tokens);

  const pairs: { [path: string]: FileAsLinkedListArray } = {};

  // Iterate through the tokens
  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i];

    // Check if the token is of type 'paragraph'
    if (token.type === "paragraph") {
      const trimmedText = token.text.trim();
      const nextToken = tokens.slice(i + 1).find((t) => t.type !== "space");
      // Check if the trimmed text starts and ends with backticks (`) and does not contain newline characters
      if (
        trimmedText.startsWith("`") &&
        trimmedText.endsWith("`") &&
        !trimmedText.includes("\n") &&
        nextToken?.type === "code"
      ) {
        // Extract the filePath and lineNumberRange from the trimmed text
        const filePathWithLineNumbers = trimmedText.slice(1, -1);
        const [filePath, lineNumberRange] = extractFilePathAndRange(
          filePathWithLineNumbers
        );
        // Get the fileContent from the nextToken
        let fileContent = nextToken.text.trim();
        // If a lineNumberRange is provided, replace the corresponding lines in the original fileContent

        if (lineNumberRange) {
          // Read the original content of the file
          const fs = require("fs");
          const original = fs.readFileSync(filePath, "utf8");
          if (!pairs[filePath]) {
            pairs[filePath] = new FileAsLinkedListArray(original);
          }
          // Replace the content within the lineNumberRange with the updated content
          fileContent = pairs[filePath].replaceLines(
            lineNumberRange[0],
            lineNumberRange[1],
            fileContent
          );
        } else {
          pairs[filePath] = new FileAsLinkedListArray(fileContent);
        }
      }
    }
  }

  // Return the pairs array containing the filePath and fileContent pairs
  return Object.entries(pairs).map(([path, file]) => [
    path,
    file.renderToString(),
  ]);
}

export function getCodeBlocks(llmOutput: string): string[] {
  // Tokenize the llmOutput using the marked package
  const tokens = marked.lexer(llmOutput);
  console.log(tokens);

  return (tokens.filter((token) => token.type === "code") as Tokens.Code[]).map(
    (token) => token.text.trim()
  );
}

export function getNotebookChangeProposal(
  llmOutput: string
): [cell: number, value: { cellType: "code" | "markdown"; content: string }][] {
  // Tokenize the llmOutput using the marked package
  const tokens = marked.lexer(llmOutput);
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

function extractFilePathAndRange(
  filePath: string
): [string, [number, number] | undefined] {
  const lastColonIndex = filePath.lastIndexOf(":");

  if (lastColonIndex !== -1 && lastColonIndex < filePath.length - 1) {
    const path = filePath.slice(0, lastColonIndex);
    const rangeString = filePath.slice(lastColonIndex + 1);
    const [start, end] = rangeString.split("-").map(Number);

    if (!isNaN(start) && !isNaN(end)) {
      return [path, [start, end]];
    }
  }

  return [filePath, undefined];
}
