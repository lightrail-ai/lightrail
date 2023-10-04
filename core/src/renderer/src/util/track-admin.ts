import type { LightrailTrack } from "lightrail-sdk";
import log from "./logger";
import {
  rendererMessagingHub,
  rendererTracksManager,
} from "./lightrail-renderer";
import ChatTrack from "../../../basic-tracks/chat";
import SystemTrack from "../../../basic-tracks/system";
import KBTrack from "../../../basic-tracks/kb";

export async function loadTracks(paths: string[]) {
  for (const browserPath of paths) {
    log.silly("Loading track from path: " + browserPath);
    const imp = await import(/* @vite-ignore */ browserPath);
    const track: LightrailTrack = imp.default;
    if (!track.name) {
      log.error("Track import failed from path: " + browserPath);
    } else {
      rendererMessagingHub.registerTrack(track);
      rendererTracksManager.registerTrack(track);
    }
  }
  log.silly("Loading built-in tracks...");
  for (const track of [KBTrack, SystemTrack, ChatTrack]) {
    rendererMessagingHub.registerTrack(track);
    rendererTracksManager.registerTrack(track);
  }
}
