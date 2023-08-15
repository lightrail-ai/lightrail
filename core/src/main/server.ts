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
    // Handle messages received from clients
    ws.on("register-client", (from) => {
      mainLightrail._registerClient(from, ws);
    });

    ws.on("lightrail-event", (event: LightrailEvent, callback?: Function) => {
      mainLightrail._processEvent(event, callback);
    });
  });

  wss.listen(1218);
  console.log("Socket.io listening on 1218");

  return wss;
}
