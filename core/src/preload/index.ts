import { exposeElectronTRPC } from "electron-trpc/main";
const { contextBridge, ipcRenderer } = require("electron");
import "./typedefs";

const ipcApi = {
  onLightrailMessage: (callback) => {
    ipcRenderer.removeAllListeners("lightrail-message");
    ipcRenderer.on("lightrail-message", callback);
  },
};

export type ipcApiType = typeof ipcApi;

contextBridge.exposeInMainWorld("electronIpc", ipcApi);

process.once("loaded", async () => {
  exposeElectronTRPC();
});
