import {
  Action,
  LightrailFS,
  LightrailLLM,
  LightrailMainProcessHandle,
  LightrailTrack,
  Token,
} from "lightrail-sdk";
import log from "./logger";
import path from "path";
import { writeFile } from "fs/promises";
import { app } from "electron";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BaseMessage } from "langchain/schema";
import { BrowserWindow } from "electron/main";
import { LightrailMessagingHub } from "../util/messaging";
import { TracksManager } from "../util/tracks";
import jsonStorage from "electron-json-storage";
import type { SettingsObject } from "./api";
import { LightrailDataStoresInterface } from "./storage";

export class LightrailChatLLMInterface {
  _history: BaseMessage[] = [];
  model: ChatOpenAI;

  constructor() {
    this.model = LightrailChatLLMInterface.initializeModel();
  }

  static initializeModel() {
    const settings = jsonStorage.getSync("settings") as SettingsObject;
    return new ChatOpenAI(
      {
        openAIApiKey: settings?.apiKeys?.[settings?.provider] ?? "EMPTY",
        streaming: true,
        modelName: settings?.model,
      },
      settings?.provider === "lightrail"
        ? {
            basePath: "https://proxy.lightrail.ai/v1/",
          }
        : undefined
    );
  }

  reset() {
    log.silly("Resetting current chat model history...");
    this._history = [];
  }
  async converse(messages, options) {
    log.silly("Sending messages to current chat model (converse): ", messages);
    this._history.push(...messages);
    const response = await this.model.call(this._history, options);
    this._history.push(response);
    log.silly("Response received from current chat model: ", response);
    return response;
  }
}

export const chatManager = new LightrailChatLLMInterface();

export const mainMessagingHub = new LightrailMessagingHub("main", log);
export const mainTracksManager = new TracksManager("main", log);

export class MainHandle implements LightrailMainProcessHandle {
  _track: LightrailTrack;
  _window: BrowserWindow;
  env: "main" = "main";
  store;

  constructor(track: LightrailTrack, window: BrowserWindow) {
    this._track = track;
    this._window = window;
    this.store = new LightrailDataStoresInterface(track);
  }

  llm: LightrailLLM = {
    chat: chatManager,
  };

  fs: LightrailFS = {
    async writeTempFile(data, originalPath) {
      log.silly("Start writing temp file...");
      let ext = "";
      if (originalPath) {
        log.silly("Original path provided, extracting extension...");
        ext = path.extname(originalPath);
      }
      const name = Math.random().toString(36).substring(7) + ext;
      const filePath = path.join(app.getPath("temp"), name);
      log.silly("File path generated: " + filePath);
      log.silly("Writing to file...");
      await writeFile(filePath, data);
      log.silly("File written successfully. Returning file path.");
      return filePath;
    },
  };

  logger = log;

  sendMessageToRenderer(
    messageName: string,
    messageBody?: any,
    broadcast?: boolean
  ): void {
    log.silly("Sending message to renderer: ", messageName, messageBody);
    this._window.webContents.send(
      "lightrail-message",
      this._track.name,
      messageName,
      messageBody,
      broadcast
    );
  }

  sendMessageToExternalClient(
    clientName: string,
    messageName: string,
    messageBody?: any
  ): Promise<any> {
    return mainMessagingHub.sendMessageToClient(
      clientName,
      messageName,
      messageBody
    );
  }

  getTrackTokens(): Token[] {
    return this._track.tokens ?? [];
  }
  getTrackActions(): Action[] {
    return this._track.actions ?? [];
  }
  getTokenByName(name: string): Token | undefined {
    return this._track.tokens?.find((t) => t.name === name);
  }
  getActionByName(name: string): Action | undefined {
    throw this._track.actions?.find((t) => t.name === name);
  }
}
