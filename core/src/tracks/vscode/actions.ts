import { Lightrail } from "lightrail-sdk";
import { ChatRequestMessage } from "llm-api";
import { getChangeProposal } from "./util";

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
        "Do not use line-numbers unless they were provided in the original context entry. " +
        "To propose creation of a new file, just output the file path and contents as above. " +
        "Make sure you do not skip any lines in your output" +
        // "If a file is long and you'd like to edit only part of it (and the relevant part wasn't provided with line-numbers in your context), you can omit unchanged lines from the code block by replacing them with the string `...unchanged...`. " +
        // "ONLY use '...unchanged...' to indicate skipped lines, do not use any other forms of ellipses or indicators. " +
        // "This string will be replaced with the original content of the file when the proposal is applied. It should be on its own line, and should be a comment (as appropriate for the language). " +
        // "Make sure to provide enough context around your edits that it is obvious where in the file they should be applied (i.e. output at least one unchanged line verbatim BEFORE AND AFTER any lines that you'd like to change). ";

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

      console.log(prompt);

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
      lightrail.ui?.reset();
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
