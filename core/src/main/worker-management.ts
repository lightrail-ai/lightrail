import { BrowserWindow } from "electron";
import { join } from "path";
import log from "./logger";
import { is } from "@electron-toolkit/utils";

let workerWin: BrowserWindow | null = null;

async function getWorker(): Promise<BrowserWindow> {
  if (!workerWin) {
    workerWin = new BrowserWindow({
      show: false,
    });

    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      const url = process.env["ELECTRON_RENDERER_URL"] + "/worker.html";
      log.silly("Loading worker from " + url);
      workerWin.loadURL(url);
    } else {
      log.silly(
        "Loading worker from " + join(__dirname, "../renderer/worker.html")
      );
      workerWin.loadFile(join(__dirname, "../renderer/worker.html"));
    }

    return new Promise((resolve) => {
      workerWin?.webContents.on("did-finish-load", async () => {
        const initialized = await workerWin?.webContents.executeJavaScript(
          "initialize()"
        );
        if (!initialized) {
          throw new Error("Failed to initialize vectorizer worker");
        }
        resolve(workerWin!);
      });
    });
  }
  return workerWin;
}

export async function getVectorizer() {
  const worker = await getWorker();
  return {
    vectorize: async (content: string[]) => {
      return await worker.webContents.executeJavaScript(
        `vectorize(${JSON.stringify(content)})`
      );
    },
  };
}
