import type { Lightrail, LightrailTrack } from "lightrail-sdk";
import { registerTokens } from "./tokens";
import { registerActions } from "./actions";

export default class Track implements LightrailTrack {
  lightrail: Lightrail;

  constructor(lightrail) {
    this.lightrail = lightrail;
  }

  async init() {
    const { fileHandle, selectedFilesHandle, selectionHandle } =
      await registerTokens(this.lightrail);
    const { editHandle } = await registerActions(this.lightrail);

    function enableAll() {
      selectionHandle?.enable();
      selectedFilesHandle?.enable();
      editHandle?.enable();
      fileHandle?.enable();
    }

    if (this.lightrail.isRenderer) {
      this.lightrail.registerEventListener(
        "lightrail:client-connected",
        async ({ data }) => {
          if (data.name === "vscode-client") {
            enableAll();
          }
        }
      );

      this.lightrail.registerEventListener("vscode:heartbeat", async () => {
        enableAll();
      });

      this.lightrail.registerEventListener(
        "lightrail:client-disconnected",
        async ({ data }) => {
          if (data.name === "vscode-client") {
            selectionHandle?.disable();
            selectedFilesHandle?.disable();
            editHandle?.disable();
            fileHandle?.disable();
          }
        }
      );

      this.lightrail.registerEventListener("vscode:new-selection", async () => {
        selectionHandle?.prioritize();
      });
    }
  }
}
