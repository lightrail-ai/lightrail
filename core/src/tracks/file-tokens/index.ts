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
      colors: ["#54aeff", "#eeeeee"],
      async handler(args, prompt) {
        const [filePath] = args;
        const fs = require("fs");
        const path = require("path");
        // read file contents
        const data = fs.readFileSync(filePath, "utf8");
        return prompt + "\n\n```\n" + data + "\n```\n\n";
      },
      renderer(args) {
        return "file:" + args[0].split("/").pop();
      },
    });
  }
}
