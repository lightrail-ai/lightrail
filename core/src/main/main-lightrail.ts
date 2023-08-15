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

  registerAction(action: Action): boolean {
    this.actions.set(action.name, action);
    return true;
  }
  registerToken(token: Token): boolean {
    this.tokens.set(token.name, token);
    return true;
  }
  registerEventListener(
    eventName: LightrailEventName,
    handler: (event: LightrailEvent) => Promise<any>
  ): boolean {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }
    this.eventListeners[eventName].push(handler);
    return true;
  }

  sendEvent(event: LightrailEvent, destinationClient?: string): Promise<any> {
    if (destinationClient) {
      console.log("Sending event to: " + destinationClient);
      return new Promise((resolve) => {
        this.clients[destinationClient].emit(
          "lightrail-event",
          event,
          (response: any) => {
            resolve(response);
          }
        );
      });
    } else {
      this.window.webContents.send("lightrail-event", event);
    }
    return new Promise((resolve) => resolve(true));
  }

  _processEvent(e: LightrailEvent, callback?: Function) {
    const listeners = this.eventListeners[e.name];
    if (listeners) {
      for (const listener of listeners) {
        listener(e).then((response) => {
          if (callback) {
            callback(response);
          }
        });
      }
    }
  }
  _registerClient(name: string, client: Socket) {
    this.clients[name] = client;
  }

  getLLMClient() {
    const settings = jsonStorage.getSync("settings") as SettingsObject;
    return new OpenAIChatApi(
      {
        apiKey: settings.openAIApiKey,
      },
      {
        model: "gpt-3.5-turbo-16k-0613",
        stream: true,
      }
    );
  }

  async writeTempFile(data, originalPath?: string): Promise<string> {
    let ext = "";
    if (originalPath) {
      ext = path.extname(originalPath);
    }
    const name = Math.random().toString(36).substring(7) + ext;
    const filePath = path.join(app.getPath("temp"), name);
    await writeFile(filePath, data);
    return filePath;
  }
}
