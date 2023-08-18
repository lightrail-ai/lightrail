import { Lightrail } from "lightrail-sdk";
import { ChatRequestMessage } from "llm-api";

function getChangeProposal(llmOutput: string): Array<[string, string]> {
  const regex = /`([^`]+)`\s*```[a-z]*\n([^`]+)```/gm;
  const pairs: Array<[string, string]> = [];
  let match;

  while ((match = regex.exec(llmOutput)) !== null) {
    const filePathWithLineNumbers = match[1].trim();
    let fileContent = match[2].trim();
    const [filePath, lineNumberRange] = extractFilePathAndRange(
      filePathWithLineNumbers
    );
    if (lineNumberRange) {
      const fs = require("fs");
      const original = fs.readFileSync(filePath, "utf8");
      fileContent = replaceContentInRange(
        original,
        fileContent,
        lineNumberRange[0],
        lineNumberRange[1]
      );
    }
    pairs.push([filePath, fileContent]);
  }

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

export function registerActions(lightrail: Lightrail) {
  const editHandle = lightrail.registerAction({
    name: "Edit in VSCode",
    description: "Suggest edits in VSCode",
    args: [],
    color: "#007ACC",
    icon: "window-maximize",
    disabled: true,
    async mainHandler(userPrompt, _args) {
      const { EventEmitter } = require("events");
      const llmClient = lightrail.getLLMClient()!;
      const ee = new EventEmitter();

      const prompt =
        userPrompt +
        "\n\n" +
        'Output your response as a series of file paths (in backticks, i.e. as inline code) followed by code blocks of the updated file contents you\'d like to propose, like this: \n\n`/path/to/file1.js`\n```js\nconst x = 1;\n```\n\n`/path/to/file2.py`\n```python\nprint("Hello World")\n```\n\n' +
        "Don't output any other content in your response. If editing a section of a file that was provided with line-numbers, please output the line-numbers in the file path, like this: `/path/to/file1.js:1-3`. " +
        "To propose creation of a new file, just output the file path and contents as above.";

      ee.on("data", (data) => {
        lightrail.sendEvent({
          name: "vscode:codegen-token",
          data: data,
        });
      });

      const chatMessage: ChatRequestMessage = {
        role: "user",
        content: prompt,
      };
      const response = await llmClient.chatCompletion([chatMessage], {
        events: ee,
      });

      lightrail.sendEvent({
        name: "vscode:codegen-response",
        data: response.content,
      });

      const proposedContent = getChangeProposal(response.content);
      console.log(proposedContent);

      const tempFiles = await Promise.all(
        proposedContent.map(([path, content]) =>
          lightrail.writeTempFile(content, path)
        )
      );

      const pairs = proposedContent.map(([path, _content], i) => [
        path,
        tempFiles[i],
      ]);

      lightrail.sendEvent(
        {
          name: "vscode:codegen-proposals",
          data: pairs,
        },
        "vscode-client"
      );
    },
    async rendererHandler(prompt, args) {
      lightrail.ui?.setView("chat");
      lightrail.ui?.chat.setHistory([]);
    },
  });

  if (lightrail.isRenderer) {
    lightrail.registerEventListener(
      "vscode:codegen-response",
      async (event) => {
        const response = event.data;
        lightrail.ui?.chat.setPartialMessage(null);
        lightrail.ui?.chat.setHistory((prev) => [
          ...prev,
          {
            sender: "ai",
            content: response,
          },
        ]);
      }
    );
    lightrail.registerEventListener("vscode:codegen-token", async (event) => {
      const token = event.data;
      lightrail.ui?.chat.setPartialMessage((prev) =>
        prev ? prev + token : token
      );
    });
  }

  return {
    editHandle,
  };
}
