import { Server } from "socket.io";
import log from "./logger";
import { mainMessagingHub, mainTracksManager } from "./lightrail-main";

export function startWSServer() {
  // Create a SocketIO server
  log.info("Starting WebSocket Server...");
  const wss = new Server({
    cors: {
      origin: "*",
    },
    // Added maxHttpBufferSize to increase the limit for large messages
    maxHttpBufferSize: 1e8, // Increase this number as needed
  });

  // Handle incoming WebSocket connections
  wss.on("connection", (ws) => {
    let connectionDetails = {
      name: null,
    };

    // Handle messages received from clients
    ws.on("register-client", (from) => {
      log.info("Client registered: " + from);
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
        log.debug(
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
      log.info("Client disconnected: ", connectionDetails.name);
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
  log.info("Socket.io listening on 1218");

  return wss;
}
