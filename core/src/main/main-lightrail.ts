import { BrowserWindow } from "electron/main";
import { OpenAIChatApi } from "llm-api";
import {
  Action,
  LightrailEvent,
  LightrailEventName,
  Token,
  Lightrail,
} from "lightrail-sdk";
import { SettingsObject } from "./api";
import jsonStorage from "electron-json-storage";
import { Socket } from "socket.io";
import { app } from "electron";
import path from "path";
import { writeFile } from "fs/promises";
import log from "./logger";

export class MainLightrail implements Lightrail {
  actions: Map<string, Action> = new Map();
  tokens: Map<string, Token> = new Map();
  eventListeners: {
    [eventName: string]: ((event: LightrailEvent) => Promise<any>)[];
  } = {};
  clients: {
    [name: string]: Socket;
  } = {};
  window: BrowserWindow;
  isRenderer = false;
  isMain = true;
  ui = undefined;

  constructor(window: BrowserWindow) {
    this.window = window;
  }

  registerAction(action: Action) {
    log.silly("Registering action: " + action.name);
    this.actions.set(action.name, action);
  }
  registerToken(token: Token) {
    log.silly("Registering token: " + token.name);
    this.tokens.set(token.name, token);
  }
  registerEventListener(
    eventName: LightrailEventName,
    handler: (event: LightrailEvent) => Promise<any>
  ): boolean {
    log.silly("Attempting to register event listener for: " + eventName);
    if (!this.eventListeners[eventName]) {
      log.silly("No existing listeners for this event. Creating a new array.");
      this.eventListeners[eventName] = [];
    }
    this.eventListeners[eventName].push(handler);
    log.silly("Event listener registered successfully for: " + eventName);
    return true;
  }

  sendEvent(event: LightrailEvent, destinationClient?: string): Promise<any> {
    log.silly("Preparing to send event: ", event);
    if (destinationClient) {
      log.silly("Sending event to: " + destinationClient);
      return new Promise((resolve) => {
        log.silly("Actual event sending in progress...");
        this.clients[destinationClient].emit(
          "lightrail-event",
          event,
          (response: any) => {
            log.silly("Event sent, received response: ", response);
            resolve(response);
          }
        );
      });
    } else {
      log.silly("No specific destination client, sending event to renderer.");
      this.window.webContents.send("lightrail-event", event);
    }
    log.silly("Event sent.");
    return new Promise((resolve) => resolve(true));
  }

  _processEvent(e: LightrailEvent, callback?: Function) {
    log.silly("Received event to process: ", e);
    const listeners = this.eventListeners[e.name];
    if (listeners) {
      log.silly("Listeners found for this event, iterating...");
      for (const listener of listeners) {
        log.silly("Processing listener");
        listener(e).then((response) => {
          log.silly("Listener completed, response: ", response);
          if (callback) {
            log.silly("Callback found, executing with response.");
            callback(response);
          }
        });
      }
    } else {
      log.silly("No listeners found for this event.");
    }
  }

  _registerClient(name: string, client: Socket) {
    log.silly("Registering client with name: " + name);
    this.clients[name] = client;
    log.silly("Client registered successfully.");
  }

  getLLMClient() {
    log.silly("Getting LLM Client settings...");
    const settings = jsonStorage.getSync("settings") as SettingsObject;
    log.silly("Settings obtained. Model: " + settings.model);
    log.silly("Creating a new OpenAIChatApi instance...");
    return new OpenAIChatApi(
      {
        apiKey: settings.openAIApiKey,
      },
      {
        model: settings.model ?? "gpt-3.5-turbo-16k-0613",
        stream: true,
      }
    );
  }

  async writeTempFile(data, originalPath?: string): Promise<string> {
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
  }
}
