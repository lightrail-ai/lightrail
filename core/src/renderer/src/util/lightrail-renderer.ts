import {
  ActionHandle,
  LightrailRendererProcessHandle,
  LightrailTrack,
  LightrailUI,
  TokenHandle,
} from "lightrail-sdk";
import { trpcClient } from "./trpc-client";
import { TracksManager } from "../../../util/tracks";
import log from "./logger";
import { LightrailMessagingHub } from "../../../util/messaging";

export const rendererTracksManager = new TracksManager("renderer", log);
export const rendererMessagingHub = new LightrailMessagingHub("renderer", log);

export class RendererHandle implements LightrailRendererProcessHandle {
  env: "renderer" = "renderer";
  _track: LightrailTrack;
  ui: LightrailUI | undefined;
  logger = log;

  constructor(track: LightrailTrack, ui: LightrailUI) {
    this._track = track;
    this.ui = ui;
  }

  sendMessageToMain(
    messageName: string,
    messageBody?: any,
    broadcast?: boolean | undefined
  ): Promise<any> {
    return trpcClient.clientEvent.mutate({
      track: this._track.name,
      name: messageName,
      body: messageBody,
      broadcast: broadcast,
    });
  }

  getTrackTokens(): TokenHandle[] {
    return rendererTracksManager.getTrackTokenHandles(this._track.name);
  }

  getTrackActions(): ActionHandle[] {
    return rendererTracksManager.getTrackActionHandles(this._track.name);
  }
  getTokenByName(name: string): TokenHandle | undefined {
    return rendererTracksManager.getTokenHandle(this._track.name, name);
  }
  getActionByName(name: string): ActionHandle | undefined {
    return rendererTracksManager.getActionHandle(this._track.name, name);
  }
}
