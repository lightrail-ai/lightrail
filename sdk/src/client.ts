import { type Socket } from "socket.io-client";

export class LightrailClient {
  _socket: Socket;
  _name: string;
  _handlers: {
    [messageName: string]: (messageBody: any) => Promise<any>;
  } = {};

  constructor(name: string, socket: Socket) {
    this._name = name;
    this._socket = socket;
    this._socket.on("connect", () => {
      console.log("Connected to socket.io server");
      this._socket.emit("register-client", name);
    });
    this._socket.on("connect_error", (err) => {
      console.log("Connection error", err);
    });

    this._socket.on(
      "lightrail-message",
      (messageName: string, messageBody: any, callback?: Function) => {
        this._processMessage(messageName, messageBody, callback);
      }
    );
  }

  _processMessage(messageName: string, messageBody: any, callback?: Function) {
    const handler = this._handlers[messageName];
    if (handler) {
      handler(messageBody).then((response) => {
        if (callback) {
          callback(response);
        }
      });
    }
  }

  sendMessageToMain(
    trackName: string,
    messageName: string,
    messageBody: any,
    broadcast?: boolean
  ): Promise<any> {
    return new Promise((resolve) => {
      this._socket.emit(
        "lightrail-message",
        trackName,
        messageName,
        messageBody,
        broadcast,
        (response: any) => {
          resolve(response);
        }
      );
    });
  }

  registerHandler(
    messageName: string,
    handler: (messageBody: any) => Promise<any>
  ): void {
    this._handlers[messageName] = handler;
  }
}
