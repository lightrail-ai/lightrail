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
      colors: ["#deddda", "#111111"],
      args: [],
      async handler(args) {},
      icon: "window-maximize",
    });
  }
}
