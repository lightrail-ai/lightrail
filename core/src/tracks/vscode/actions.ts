import { Lightrail } from "lightrail-sdk";
import { ChatRequestMessage } from "llm-api";

function parseLLMOutput(llmOutput: string): Array<[string, string]> {
  const regex = /`([^`]+)`\s*```[a-z]*\n([^`]+)```/gm;
  const pairs: Array<[string, string]> = [];
  let match;

  while ((match = regex.exec(llmOutput)) !== null) {
    const filePath = match[1].trim();
    const fileContent = match[2].trim();
    pairs.push([filePath, fileContent]);
  }

  return pairs;
}

export function registerActions(lightrail: Lightrail) {
  lightrail.registerAction({
    name: "Edit in VSCode",
    description: "Suggest edits in VSCode",
    args: [],
    color: "#007ACC",
    icon: "window-maximize",
    async mainHandler(userPrompt, _args) {
      const { EventEmitter } = require("events");
      const llmClient = lightrail.getLLMClient()!;
      const ee = new EventEmitter();

      const prompt =
        userPrompt +
        "\n\n" +
        "Output your response as a series of file paths (in backticks, i.e. as inline code) followed by code blocks of the updated file contents you'd like to propose, like this: \n\n`/path/to/file1.js`\n```js\nconst x = 1;\n```\n\n`/path/to/file2.py`\n```python\nprint(\"Hello World\")\n```\n\n Don't output any other content in your response.";

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

      const proposedContent = parseLLMOutput(response.content);
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
}
