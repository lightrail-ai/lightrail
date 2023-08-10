import { exposeElectronTRPC } from "electron-trpc/main";
const { contextBridge, ipcRenderer } = require("electron");
import "./typedefs";

const ipcApi = {
  onLightrailEvent: (callback) => ipcRenderer.on("lightrail-event", callback),
};

export type ipcApiType = typeof ipcApi;

contextBridge.exposeInMainWorld("electronIpc", ipcApi);

process.once("loaded", async () => {
  exposeElectronTRPC();
});
