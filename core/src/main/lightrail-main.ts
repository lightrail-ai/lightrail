import {
  Action,
  LightrailFS,
  LightrailLLM,
  LightrailMainProcessHandle,
  LightrailTrack,
  Token,
  TransformSourceOptions,
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
import { LightrailDataStoresInterface } from "./storage/interface";
import transforms from "./transforms";
import { Tiktoken, getEncoding } from "js-tiktoken";

const tokenLimits = {
  "gpt-4": 8192,
  "gpt-3.5-turbo-16k": 16385,
  "gpt-3.5-turbo": 4097,
};

export class LightrailChatLLMInterface {
  _history: BaseMessage[] = [];
  model: ChatOpenAI;
  tokenizer: Tiktoken;
  _modelName: SettingsObject["model"] = "gpt-4";

  _countTokens(text: string) {
    return this.tokenizer.encode(text).length;
  }

  constructor() {
    this.model = LightrailChatLLMInterface.initializeModel();
    this.tokenizer = getEncoding("cl100k_base");
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
    const settings = jsonStorage.getSync("settings") as SettingsObject;
    const model = settings?.model ?? "gpt-4";

    log.silly("Sending messages to current chat model (converse): ", messages);
    this._history.push(...messages);
    let requestMessages = [...this._history];
    while (
      this._countTokens(
        requestMessages.map((m) => m.toDict().data.content).join("\n")
      ) > tokenLimits[model] &&
      requestMessages.length > 1
    ) {
      requestMessages.shift();
    }
    const response = await this.model.call(requestMessages, options);
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
  transform = transforms;

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
