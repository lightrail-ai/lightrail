import log from "./logger";
import { app } from "electron";
import { installTrack } from "./track-admin";
import { promisify } from "util";
import jsonStorage from "electron-json-storage";

const midCache: {
  mid: string | undefined;
} = {
  mid: undefined,
};

async function getMID() {
  if (midCache.mid) {
    return midCache.mid;
  }
  const midObj = (await promisify(jsonStorage.get)("mid")) as { mid: string };
  let mid = midObj?.mid;
  if (mid) {
    midCache.mid = mid;
    return mid;
  }
  const newMid =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  await promisify(jsonStorage.set)("mid", { mid: newMid });
  midCache.mid = newMid;
  return newMid;
}

export async function fetchTrackUpdates() {
  log.silly("Checking for track updates");
  try {
    const mid = await getMID();
    const res = await fetch(
      `https://update.lightrail.ai?mid=${mid}&version=${app.getVersion()}`
    );
    const json = await res.json();
    const updates: string[] = json.updates;
    for (const update of updates) {
      await installTrack(update);
    }
  } catch {
    log.error("Failed to check for track updates");
  }
}
