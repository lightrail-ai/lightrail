import { Server } from "socket.io";
import { MainLightrail } from "./main-lightrail";
import type { LightrailEvent } from "lightrail-sdk";

export function startWSServer(mainLightrail: MainLightrail) {
  // Create a SocketIO server
  const wss = new Server({
    cors: {
      origin: "*",
    },
  });

  // Handle incoming WebSocket connections
  wss.on("connection", (ws) => {
    let connectionDetails = {
      name: null,
    };

    // Handle messages received from clients
    ws.on("register-client", (from) => {
      console.log("Client Registered: " + from);
      connectionDetails.name = from;
      mainLightrail._registerClient(from, ws);
      const connectEvent: LightrailEvent = {
        name: "lightrail:client-connected",
        data: {
          name: connectionDetails.name,
        },
      };
      mainLightrail._processEvent(connectEvent);
      mainLightrail.sendEvent(connectEvent);
    });

    ws.on("lightrail-event", (event: LightrailEvent, callback?: Function) => {
      mainLightrail._processEvent(event, callback);
      mainLightrail.sendEvent(event);
    });

    ws.on("disconnect", () => {
      const diconnectEvent = {
        name: "lightrail:client-disconnected",
        data: {
          name: connectionDetails.name,
        },
      };
      mainLightrail._processEvent(diconnectEvent);
      mainLightrail.sendEvent(diconnectEvent);
    });
  });

  wss.listen(1218);
  console.log("Socket.io listening on 1218");

  return wss;
}
