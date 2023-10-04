import { TransformSourceOptions } from "lightrail-sdk";

import Parser, { SyntaxNode } from "web-tree-sitter";

class Span {
  start: number; // line number, 0-indexed, inclusive
  end: number; // line number, 0-indexed, inclusive

  constructor(start: number = 0, end: number = 0) {
    this.start = start;
    this.end = end;
  }

  extractLines(s: string): string[] {
    return s.split("\n").slice(this.start, this.end + 1);
  }
}

function chunker(
  tree: SyntaxNode,
  sourceCode: string,
  maxChars,
  coalesce
): Span[] {
  const lines = sourceCode.split("\n");
  function charCount(start, end) {
    return lines.slice(start, end + 1).join("\n").length;
  }

  function chunkNode(node: SyntaxNode): Span[] {
    let chunks: Span[] = [];
    let currentChunk: Span | null = null;

    for (let child of node.children) {
      if (
        charCount(child.startPosition.row, child.endPosition.row) > maxChars
      ) {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = null;
        }
        chunks.push(...chunkNode(child));
      } else if (
        currentChunk &&
        charCount(currentChunk.start, child.endPosition.row) > maxChars
      ) {
        chunks.push(currentChunk);
        currentChunk = new Span(child.startPosition.row, child.endPosition.row);
      } else if (currentChunk) {
        currentChunk.end = child.endPosition.row;
      } else {
        currentChunk = new Span(child.startPosition.row, child.endPosition.row);
      }
    }
    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  let chunks = chunkNode(tree);

  let cleanedChunks: Span[] = [];

  for (let i = 0; i < chunks.length - 1; i++) {
    if (chunks[i].end + 1 < chunks[i + 1].start) {
      chunks[i + 1].start = chunks[i].end + 1;
    }
    if (
      chunks[i].start === chunks[i].end &&
      (chunks[i].end === chunks[i + 1].start ||
        (i > 0 && chunks[i].start === chunks[i - 1].end))
    ) {
      continue; // skip single-line chunks that are included in other chunks
    } else if (charCount(chunks[i].start, chunks[i].end) < coalesce) {
      chunks[i + 1].start = chunks[i].start;
      continue; // coalesce small chunks
    }
    cleanedChunks.push(chunks[i]);
  }

  chunks[chunks.length - 1].end = lines.length - 1;
  cleanedChunks.push(chunks[chunks.length - 1]);

  console.log(cleanedChunks);

  return cleanedChunks;
}

function getGrammarPath(language: string) {
  const path = require("path");
  const { is } = require("@electron-toolkit/utils");

  return path.join(
    is.dev ? path.join(__dirname, "../..") : process.resourcesPath,
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

export const CHUNKABLE_CODE_EXTENSIONS = [
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

export default {
  async toChunks(text: string, sourceOptions: TransformSourceOptions) {
    if (sourceOptions.path) {
      const extension = sourceOptions.path.split(".").pop();
      if (extension && CHUNKABLE_CODE_EXTENSIONS.includes(extension)) {
        const chunks = await chunkCode(text, sourceOptions.path);
        return chunks.map((chunk) => ({
          content: chunk.extractLines(text).join("\n"),
          from: {
            line: chunk.start,
            char: undefined,
          },
          to: {
            line: chunk.end,
            char: undefined,
          },
        }));
      }
    }
    return [];
  },
};
