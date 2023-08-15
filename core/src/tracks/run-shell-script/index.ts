import type { Lightrail, LightrailTrack } from "lightrail-sdk";

export default class Track implements LightrailTrack {
  lightrail: Lightrail;

  constructor(lightrail) {
    this.lightrail = lightrail;
  }

  async init() {
    this.lightrail.registerAction({
      name: "Run Shell Script",
      description: "Run a shell script",
      color: "#006400", // updated color
      args: [],
      async handler(prompt, args) {},
      icon: "window-maximize",
    });
  }
}