import Parser, { SyntaxNode } from "web-tree-sitter";

class Span {
  start: number;
  end: number;

  constructor(start: number = 0, end: number = 0) {
    this.start = start;
    this.end = end;

    if (this.end === null) {
      this.end = this.start;
    }
  }

  extract(s: string): string {
    return s.slice(this.start, this.end);
  }

  extractLines(s: string): string[] {
    return s.split("\n").slice(this.start, this.end);
  }

  add(other: Span | number): Span {
    if (typeof other === "number") {
      return new Span(this.start + other, this.end + other);
    } else if (other instanceof Span) {
      return new Span(this.start, other.end);
    } else {
      throw Error("Not implemented");
    }
  }

  len(): number {
    return this.end - this.start;
  }
}

function charLen(s: string): number {
  return s.length;
}

function nonWhitespaceLen(s: string): number {
  return s.replace(/\s/g, "").length;
}

function getLineNumber(byteIndex: number, lineData: string[]): number {
  const lineBreakCount = lineData
    .slice(0, byteIndex)
    .reduce((sum, currentChar) => sum + (currentChar === "\n" ? 1 : 0), 0);
  return lineBreakCount;
}

function chunker(
  tree: SyntaxNode,
  sourceCode: string,
  maxChars,
  coalesce
): Span[] {
  function chunkNode(node: SyntaxNode): Span[] {
    let chunks: Span[] = [];
    let currentChunk: Span = new Span(node.startIndex, node.startIndex);

    for (let child of node.children) {
      if (child.endIndex - child.startIndex > maxChars) {
        chunks.push(currentChunk);
        currentChunk = new Span(child.endIndex, child.endIndex);
        chunks.push(...chunkNode(child));
      } else if (
        child.endIndex - child.startIndex + currentChunk.len() >
        maxChars
      ) {
        chunks.push(currentChunk);
        currentChunk = new Span(child.startIndex, child.endIndex);
      } else {
        currentChunk = currentChunk.add(
          new Span(child.startIndex, child.endIndex)
        );
      }
    }
    chunks.push(currentChunk);

    return chunks;
  }

  let chunks = chunkNode(tree);

  for (let i = 0; i < chunks.length - 1; i++) {
    chunks[i].end = chunks[i + 1].start;
  }
  chunks[chunks.length - 1].start = tree.endIndex;

  const newChunks: Span[] = [];
  let currentChunk: Span = new Span(0, 0);
  for (const chunk of chunks) {
    currentChunk = currentChunk.add(chunk);
    if (
      nonWhitespaceLen(currentChunk.extract(sourceCode)) > coalesce &&
      currentChunk.extract(sourceCode).includes("\n")
    ) {
      newChunks.push(currentChunk);
      currentChunk = new Span(chunk.end, chunk.end);
    }
  }
  if (currentChunk.len() > 0) {
    newChunks.push(currentChunk);
  }

  const lineData = sourceCode.split("");

  const lineChunks: Span[] = newChunks.map(
    (chunk) =>
      new Span(
        getLineNumber(chunk.start, lineData),
        getLineNumber(chunk.end, lineData)
      )
  );

  return lineChunks.filter((chunk) => chunk.len() > 0);
}

function getGrammarPath(language: string) {
  const path = require("path");
  return path.join(
    "/home/vishnumenon/Documents/lightrail/core", // TODO productionize this
    "lib",
    "tree-sitter-grammars",
    `tree-sitter-${language}.wasm`
  );
}

function getLanguageFromExtension(extension: string): string {
  switch (extension) {
    case "js":
    case "jsx":
      return "javascript";
    case "ts":
      return "typescript";
    case "tsx":
      return "tsx";
    case "py":
      return "python";
    case "java":
      return "java";
    case "rs":
      return "rust";
    case "go":
      return "go";
    case "cpp":
    case "cc":
    case "cxx":
    case "c++":
    case "hpp":
    case "hh":
    case "hxx":
    case "h++":
      return "cpp";
    case "c":
      return "c";
    case "yaml":
      return "yaml";
    case "json":
      return "json";
    case "html":
    case "htm":
      return "html";
    case "css":
      return "css";
    default:
      return "";
  }
}

export const VALID_CODE_EXTENSIONS = [
  "js",
  "jsx",
  "ts",
  "tsx",
  "py",
  "java",
  "rs",
  "go",
  "cpp",
  "cc",
  "cxx",
  "c++",
  "hpp",
  "hh",
  "hxx",
  "h++",
  "c",
  "yaml",
  "json",
  "html",
  "htm",
  "css",
];

export async function chunkCode(
  sourceCode: string,
  filename: string,
  maxChars = 512 * 3,
  coalesce = 50
): Promise<Span[]> {
  const path = require("path");
  await Parser.init();
  const parser = new Parser();
  let extension: string | undefined;
  extension = filename.split(".").pop();
  let grammar;

  if (!extension) {
    return [];
  }

  // Use getGrammarPath to get the grammar path for each language
  const grammarPath = getGrammarPath(getLanguageFromExtension(extension));

  // Load the language grammar using the grammar path
  grammar = await Parser.Language.load(grammarPath);

  parser.setLanguage(grammar);
  const tree = parser.parse(sourceCode);
  const chunks = chunker(tree.rootNode, sourceCode, maxChars, coalesce);
  return chunks;
}
