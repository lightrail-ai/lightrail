import log from "./logger";
import { BrowserWindow, app } from "electron";
import { installTrack } from "./track-admin";
import { promisify } from "util";
import jsonStorage from "electron-json-storage";
import os from "os";
import { isComplete } from "./checklist";

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

interface Notice {
  id: string;
  content: string;
}

export let noticeQueue: Notice[] = [];

export async function fetchUpdates(window: BrowserWindow) {
  log.silly("Checking for lightrail server updates...");
  try {
    const mid = await getMID();
    const res = await fetch(
      `https://update.lightrail.ai?mid=${mid}&version=${app.getVersion()}&platform=${os.platform()}&arch=${os.arch()}`
    );
    const updates = await res.json();
    const tracks: string[] = updates.tracks ?? [];
    const notices: Notice[] = updates.notices ?? [];
    for (const trackUpdate of tracks) {
      await installTrack(trackUpdate);
    }
    if (notices && notices.length > 0) {
      noticeQueue = [];
      log.silly("Notices received from lightrail server.");
      for (const notice of notices) {
        const complete = await isComplete(notice.id);
        if (!complete) {
          log.silly("Adding notice to queue: " + notice.id);
          noticeQueue.push(notice);
        } else {
          log.silly("Notice already complete: " + notice.id);
        }
      }
      window.webContents.send("new-notice");
    }
  } catch (e) {
    log.error("Failed to check for updates from lightrail server: " + e);
  }
}
