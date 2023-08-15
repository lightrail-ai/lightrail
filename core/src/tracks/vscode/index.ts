import type { Lightrail, LightrailTrack } from "lightrail-sdk";
import { registerTokens } from "./tokens";
import { registerActions } from "./actions";

export default class Track implements LightrailTrack {
  lightrail: Lightrail;

  constructor(lightrail) {
    this.lightrail = lightrail;
  }

  async init() {
    await registerTokens(this.lightrail);
    await registerActions(this.lightrail);
  }
}
