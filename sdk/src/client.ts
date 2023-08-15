import { type Socket } from "socket.io-client";
import type { LightrailEvent, LightrailEventName } from "./lightrail";

export class LightrailClient {
  socket: Socket;
  name: string;
  eventListeners: {
    [eventName: string]: ((event: LightrailEvent) => Promise<any>)[];
  } = {};

  constructor(name: string, socket: Socket) {
    this.name = name;
    this.socket = socket;
    this.socket.on("connect", () => {
      console.log("Connected to socket.io server");
      this.socket.emit("register-client", name);
    });
    this.socket.on("connect_error", (err) => {
      console.log("Connection error", err);
    });

    this.socket.on(
      "lightrail-event",
      (event: LightrailEvent, callback?: Function) => {
        this._processEvent(event, callback);
      }
    );
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

  sendEvent(event: LightrailEvent): Promise<any> {
    return new Promise((resolve) => {
      this.socket.emit("lightrail-event", event, (response: any) => {
        resolve(response);
      });
    });
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
}
