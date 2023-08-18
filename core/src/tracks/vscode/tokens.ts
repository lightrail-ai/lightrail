import { Lightrail } from "lightrail-sdk";

export async function registerTokens(lightrail: Lightrail) {
  const selectionHandle = lightrail.registerToken({
    name: "vscode-selection",
    description: "VSCode Current Selection",
    args: [],
    color: "#007ACC",
    disabled: true,
    async handler(args, prompt) {
      const { file, range, content } = await lightrail.sendEvent(
        {
          name: "vscode:get-selection",
          data: null,
        },
        "vscode-client"
      );

      const contextTitle = file + ":" + range.start.line + "-" + range.end.line;
      prompt.appendContextItem({
        type: "code",
        title: contextTitle,
        content: content,
      });
      prompt.appendText(contextTitle);

      return prompt;
    },
    renderer(args) {
      return "vscode-selection";
    },
  });

  const selectedFilesHandle = lightrail.registerToken({
    name: "vscode-selected-files",
    description: "VSCode Selected Files",
    args: [],
    color: "#007ACC",
    disabled: true,
    async handler(args, prompt) {
      const selectedFiles = await lightrail.sendEvent(
        {
          name: "vscode:get-selected-files",
          data: null,
        },
        "vscode-client"
      );

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

      prompt.appendText(`the following files: [ ${selectedFiles.join(", ")} ]`);
      return prompt;
    },
    renderer(args) {
      return "vscode-selected-files";
    },
  });

  const fileHandle = lightrail.registerToken({
    name: "vscode-current-file",
    description: "VSCode Current File",
    args: [],
    color: "#007ACC",
    disabled: true,
    async handler(args, prompt) {
      const fs = require("fs");
      const currentFile = await lightrail.sendEvent(
        {
          name: "vscode:get-editing-file",
          data: null,
        },
        "vscode-client"
      );

      // read file contents
      const data = fs.readFileSync(currentFile, "utf8");

      prompt.appendContextItem({
        type: "code",
        title: currentFile,
        content: data,
      });

      prompt.appendText(currentFile);

      return prompt;
    },
    renderer(args) {
      return "vscode-current-file";
    },
  });

  return {
    selectionHandle,
    selectedFilesHandle,
    fileHandle,
  };
}
