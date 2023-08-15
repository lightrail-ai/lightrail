import { Lightrail } from "lightrail-sdk";

export async function registerTokens(lightrail: Lightrail) {
  lightrail.registerToken({
    name: "vscode-selection",
    description: "VSCode Current Selection",
    args: [],
    color: "#007ACC",
    async handler(args, prompt) {
      const selection = await lightrail.sendEvent(
        {
          name: "vscode:get-selection",
          data: null,
        },
        "vscode-client"
      );

      return prompt + "\n\n```\n" + selection + "\n```\n\n";
    },
    renderer(args) {
      return "vscode-selection";
    },
  });

  lightrail.registerToken({
    name: "vscode-selected-files",
    description: "VSCode Selected Files",
    args: [],
    color: "#007ACC",
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
      const fileContents = selectedFiles.map((path) => {
        const data = fs.readFileSync(path, "utf8");
        return "\n\n" + path + "\n```\n" + data + "\n```\n\n";
      });

      return prompt + fileContents;
    },
    renderer(args) {
      return "vscode-selected-files";
    },
  });

  lightrail.registerToken({
    name: "vscode-current-file",
    description: "VSCode Current File",
    args: [],
    color: "#007ACC",
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

      return prompt + "\n\n`" + currentFile + "`\n```\n" + data + "\n```\n\n";
    },
    renderer(args) {
      return "vscode-current-file";
    },
  });
}
