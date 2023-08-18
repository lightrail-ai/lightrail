import type { Lightrail, LightrailTrack } from "lightrail-sdk";

export default class Track implements LightrailTrack {
  lightrail: Lightrail;

  constructor(lightrail) {
    this.lightrail = lightrail;
  }

  async init() {
    this.lightrail.registerToken({
      name: "file",
      description: "Access Filesystem",
      args: [
        {
          name: "file path",
          description: "Path to file",
          type: "path",
        },
      ],
      color: "#54aeff",
      async handler(args, prompt) {
        const [filePath] = args;
        const fs = require("fs");
        // read file contents
        const data = fs.readFileSync(filePath, "utf8");
        prompt.appendContextItem({
          type: "code",
          title: filePath,
          content: data,
        });
        prompt.appendText(filePath);
        return prompt;
      },
      renderer(args) {
        return "file:" + args[0].split("/").pop();
      },
    });
  }
}
