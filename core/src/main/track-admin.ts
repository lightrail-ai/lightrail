import { app } from "electron";
import path from "path";
import log from "./logger";
import { mainMessagingHub, mainTracksManager } from "./lightrail-main";
import ChatTrack from "../basic-tracks/chat";
import SystemTrack from "../basic-tracks/system";
import KBTrack from "../basic-tracks/kb";
import * as fs from "fs/promises";
import type { LightrailTrack } from "lightrail-sdk";
import AdmZip from "adm-zip";

export const TRACKS_DIR = path.join(app.getPath("userData"), "tracks");

export async function loadTracks() {
  log.info("(Re)loading tracks");
  // Load tracks from disk
  const tracksRoot = TRACKS_DIR;
  // List tracks from tracks folder
  const trackDirs = await fs.readdir(tracksRoot);
  log.info("Found Tracks: " + JSON.stringify(trackDirs));
  let pathsForRenderer: string[] = [];
  for (const trackDir of trackDirs) {
    log.info("Loading track from dir: " + trackDir);
    const trackDirPath = path.join(tracksRoot, trackDir);
    const packageJson = JSON.parse(
      await fs.readFile(path.join(trackDirPath, "package.json"), "utf-8")
    );
    const mainPath = path.resolve(trackDirPath, packageJson.main);
    const browserPath = path.resolve(trackDirPath, packageJson.browser);
    log.info("Loading track from path: " + mainPath);
    pathsForRenderer.push(
      "lightrailtrack://" + path.relative(tracksRoot, browserPath)
    );
    const imp = (await import(mainPath)).default;
    // NB: This is a hack to deal w/ some weirdness in the way bundling works currently for tracks
    const track: LightrailTrack = imp.default ? imp.default : imp;
    if (!track.name) {
      log.error("Track import failed from path: " + mainPath);
    } else {
      mainMessagingHub.registerTrack(track);
      mainTracksManager.registerTrack(track);
    }
  }
  // Load built-in tracks
  for (const track of [KBTrack, SystemTrack, ChatTrack]) {
    mainMessagingHub.registerTrack(track);
    mainTracksManager.registerTrack(track);
  }
  log.info("Tracks loaded");
  return pathsForRenderer;
}

export async function installTrack(zipPath: string) {
  log.info("Installing track(s) from url: " + zipPath);
  const resp = await fetch(zipPath);
  const ab = await resp.arrayBuffer();
  const zip = new AdmZip(Buffer.from(ab));
  zip.extractAllTo(TRACKS_DIR, true);
}

export function listInstalledTracks() {}
