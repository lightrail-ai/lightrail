import type { Socket } from "socket.io";
import type {
  LightrailMainMessageHandler,
  LightrailRendererMessageHandler,
  LightrailTrack,
} from "lightrail-sdk";
import type { LogFunctions } from "electron-log";
import { TracksManager } from "./tracks";

function isMainHandler(handle): handle is LightrailMainMessageHandler {
  return true;
}

function isRendererHandler(handle): handle is LightrailRendererMessageHandler {
  return true;
}

export class LightrailMessagingHub {
  _tracks: {
    [name: string]: LightrailTrack;
  } = {};
  _clients: {
    [name: string]: Socket;
  } = {};
  _logger: LogFunctions;

  _env: "main" | "renderer";

  constructor(env: "main" | "renderer", logger: LogFunctions) {
    this._env = env;
    this._logger = logger;
  }

  registerTrack(track: LightrailTrack) {
    if (this._tracks[track.name]) {
      this._logger.warn(
        "Messaging hub attempted to register track " +
          track.name +
          " but it was already registered!"
      );
      return;
    }
    this._logger.silly(
      `Registering track with messaging hub (${this._env}): ` + track.name
    );
    this._tracks[track.name] = track;
  }

  registerClient(name: string, client: Socket) {
    this._logger.silly(
      `Registering client with messaging hub (${this._env}): ` + name
    );
    this._clients[name] = client;
  }

  sendMessageToClient(
    clientName: string,
    messageName: string,
    messageBody?: any
  ): Promise<any> {
    this._logger.silly(
      `Sending message to external client (${clientName}): `,
      messageName,
      messageBody
    );
    return new Promise((resolve) => {
      if (!this._clients[clientName]) {
        this._logger.error(`Client ${clientName} not found!`);
        resolve(undefined);
      } else {
        this._logger.silly("Sending message " + messageName + " to client...");
        this._clients[clientName].emit(
          "lightrail-message",
          messageName,
          messageBody,
          (response: any) => {
            this._logger.silly(
              "Message " + messageName + " sent, received response: ",
              response
            );
            resolve(response);
          }
        );
      }
    });
  }

  routeMessage(
    track: string,
    tracksManager: TracksManager,
    messageName: string,
    messageBody?: any,
    broadcast?: boolean
  ): Promise<any> {
    this._logger.silly(
      `Routing message in track '${track}': `,
      messageName,
      messageBody,
      broadcast ? "(broadcast)" : ""
    );

    let returnValue = Promise.resolve();

    const handler = this._tracks[track]?.handlers?.[this._env]?.[messageName];
    if (handler) {
      this._logger.silly(
        `Found handler for message '${messageName}' in track '${track}', executing...`
      );
      const lightrailHandle = tracksManager.getProcessHandle(track);
      if (
        this._env === "main" &&
        lightrailHandle?.env === "main" &&
        isMainHandler(handler)
      ) {
        returnValue = handler(lightrailHandle, messageBody);
      } else if (
        this._env === "renderer" &&
        lightrailHandle?.env === "renderer" &&
        isRendererHandler(handler)
      ) {
        returnValue = handler(lightrailHandle, messageBody);
      } else {
        this._logger.error("Invalid handle provided for message handler!");
      }
    } else {
      this._logger.silly(
        `No handler found for message '${messageName}' in track '${track}'.`
      );
    }

    if (broadcast) {
      for (const t of Object.values(this._tracks)) {
        const handlerName = messageName.includes(":")
          ? messageName
          : `${track}:${messageName}}`;
        const handler = t.handlers?.[this._env]?.[handlerName];

        if (handler) {
          this._logger.silly(
            `Found handler for message '${handlerName}' in track '${t.name}', executing...`
          );
          const lightrailHandle = tracksManager.getProcessHandle(t.name);
          if (
            this._env === "main" &&
            lightrailHandle?.env === "main" &&
            isMainHandler(handler)
          ) {
            returnValue = handler(lightrailHandle, messageBody);
          } else if (
            this._env === "renderer" &&
            lightrailHandle?.env === "renderer" &&
            isRendererHandler(handler)
          ) {
            returnValue = handler(lightrailHandle, messageBody);
          } else {
            this._logger.error("Invalid handle provided for message handler!");
          }
        }
      }
    }

    return returnValue;
  }
}
