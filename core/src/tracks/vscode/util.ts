import { distance } from "fastest-levenshtein";
import { marked } from "marked";

function isRoughlyEqual(original: string, proposed: string) {
  // Compare the two strings, ignoring whitespace and case
  const originalTrimmed = original.trim().toLowerCase();
  const proposedTrimmed = proposed.trim().toLowerCase();
  return originalTrimmed === proposedTrimmed;
}

function chunkedDistance(original: string[], proposed: string[]) {
  if (original.length !== proposed.length) {
    return Infinity;
  }
  let total = 0;
  for (let i = 0; i < original.length; i++) {
    if (proposed[i] !== "...unchanged...") {
      total += distance(original[i], proposed[i]);
    }
  }
  return total;
}

function _partition(remainingText: string, proposalChunks: string[]): string[] {
  if (proposalChunks.length === 1) {
    return [remainingText];
  }

  const textAsLines = remainingText.split("\n");

  const [first, ...rest] = proposalChunks;
  if (first === "...unchanged...") {
    const targetChunkAsLines = rest[0].split("\n");
    let bestScore = Infinity;
    let bestPartition: string[] = [];

    for (let i = 0; i < textAsLines.length; i++) {
      if (isRoughlyEqual(targetChunkAsLines[0], textAsLines[i])) {
        const partition = [textAsLines.slice(0, i).join("\n")].concat(
          _partition(textAsLines.slice(i).join("\n"), rest)
        );
        const score = chunkedDistance(partition, proposalChunks);
        if (score < bestScore) {
          bestScore = score;
          bestPartition = partition;
        }
      }
    }

    return bestPartition;
  } else {
    const targetChunkAsLines = first.split("\n");
    let bestScore = Infinity;
    let bestPartition: string[] = [];

    for (let i = 0; i < textAsLines.length; i++) {
      if (
        isRoughlyEqual(
          targetChunkAsLines[targetChunkAsLines.length - 1],
          textAsLines[i]
        )
      ) {
        const partition = [textAsLines.slice(0, i).join("\n")].concat(
          _partition(textAsLines.slice(i).join("\n"), rest)
        );
        const score = chunkedDistance(partition, proposalChunks);
        if (score < bestScore) {
          bestScore = score;
          bestPartition = partition;
        }
      }
    }

    return bestPartition;
  }
}

function naiveChangeMerge(original: string, proposed: string): string {
  const chunks = proposed.split(/^.*\.\.\.unchanged\.\.\..*$/m);
  const targetSections = chunks
    .map((e) => ["...unchanged...", e])
    .reduce((prev, curr) => [...prev, ...curr])
    .slice(1);
  const optimalPartitions = _partition(original, targetSections);
  const output = targetSections
    .map((t, i) => (t === "...unchanged..." ? optimalPartitions[i] : t))
    .join("");
  return output;
}

export function getChangeProposal(llmOutput: string): Array<[string, string]> {
  // Tokenize the llmOutput using the marked package
  const tokens = marked.lexer(llmOutput);
  // Initialize an empty array to store the filePath and fileContent pairs
  const pairs: Array<[string, string]> = [];

  // Iterate through the tokens
  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i];
    const nextToken = tokens[i + 1];

    // Check if the token is of type 'paragraph'
    if (token.type === "paragraph") {
      const trimmedText = token.text.trim();
      // Check if the trimmed text starts and ends with backticks (`) and does not contain newline characters
      if (
        trimmedText.startsWith("`") &&
        trimmedText.endsWith("`") &&
        !trimmedText.includes("\n") &&
        nextToken.type === "code"
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
          // Replace the content within the lineNumberRange with the updated content
          fileContent = replaceContentInRange(
            original,
            fileContent,
            lineNumberRange[0],
            lineNumberRange[1]
          );
        }

        // if (fileContent.includes("...unchanged...")) {
        //   const fs = require("fs");
        //   const original = fs.readFileSync(filePath, "utf8");
        //   fileContent = naiveChangeMerge(original, fileContent);
        // }

        // Push the filePath and fileContent pair to the pairs array
        pairs.push([filePath, fileContent]);
      }
    }
  }

  // Return the pairs array containing the filePath and fileContent pairs
  return pairs;
}
function replaceContentInRange(
  originalContent: string,
  updatedContent: string,
  startLineNumber: number,
  endLineNumber: number
): string {
  const lines = originalContent.split("\n");
  lines.splice(
    startLineNumber,
    endLineNumber - startLineNumber + 1,
    updatedContent
  );
  return lines.join("\n");
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
