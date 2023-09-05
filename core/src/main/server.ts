import { Server } from "socket.io";
import log from "./logger";
import { mainMessagingHub, mainTracksManager } from "./lightrail-main";

export function startWSServer() {
  // Create a SocketIO server
  log.silly("Starting WebSocket Server...");
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
      log.silly("Client registered: " + from);
      connectionDetails.name = from;
      mainMessagingHub.registerClient(from, ws);
      mainMessagingHub.routeMessage(
        "lightrail",
        mainTracksManager,
        "client-connected",
        {
          name: from,
        },
        true
      );
    });

    ws.on(
      "lightrail-message",
      (trackName, messageName, messageBody, broadcast) => {
        log.silly(
          `Received message from client '${connectionDetails.name}': `,
          trackName,
          messageName,
          messageBody,
          broadcast ? "(broadcast)" : ""
        );
        mainMessagingHub.routeMessage(
          trackName,
          mainTracksManager,
          messageName,
          messageBody,
          broadcast
        );
      }
    );

    ws.on("disconnect", () => {
      log.silly("Client disconnected: ", connectionDetails.name);
      mainMessagingHub.routeMessage(
        "lightrail",
        mainTracksManager,
        "client-disconnected",
        {
          name: connectionDetails.name,
        },
        true
      );
    });
  });

  wss.listen(1218);
  log.silly("Socket.io listening on 1218");

  return wss;
}
