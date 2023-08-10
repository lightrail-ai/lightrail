import type { ipcApiType } from "./index";

declare global {
  interface Window {
    electronIpc: ipcApiType;
  }
}
