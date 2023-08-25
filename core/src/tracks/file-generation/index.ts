import type { Lightrail, LightrailTrack } from "lightrail-sdk";

export default class Track implements LightrailTrack {
  lightrail: Lightrail;

  constructor(lightrail) {
    this.lightrail = lightrail;
  }

  async init() {
    //   this.lightrail.registerAction({
    //     name: "Generate File",
    //     description: "Generate a file",
    //     args: [
    //       {
    //         name: "path",
    //         description: "Path to generate file",
    //         type: "path",
    //       },
    //     ],
    //     color: "#3584e4",
    //     async rendererHandler(prompt, args) {},
    //     async mainHandler(prompt, args) {},
    //     icon: "file",
    //   });
    // }
  }
}
