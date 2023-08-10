import type { Lightrail, LightrailTrack } from "lightrail-sdk";

export default class Track implements LightrailTrack {
  lightrail: Lightrail;

  constructor(lightrail) {
    this.lightrail = lightrail;
  }

  async init() {
    const lightrail = this.lightrail;
    this.lightrail.registerToken({
      name: "vscode-selection",
      description: "VSCode Current Selection",
      args: [],
      colors: ["#007ACC", "#FFFFFF"],
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

    this.lightrail.registerToken({
      name: "vscode-selected-files",
      description: "VSCode Selected Files",
      args: [],
      colors: ["#007ACC", "#FFFFFF"],
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
  }
}
