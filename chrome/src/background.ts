import { LightrailClient } from "lightrail-sdk";
import { io } from "socket.io-client";

let lightrailClient = new LightrailClient(
  "chrome-client",
  io("ws://localhost:1218", {
    transports: ["websocket"],
  }) as any
);

lightrailClient.registerEventListener("chrome:get-current-page", async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  if (tab) {
    const { url, html } = await chrome.tabs.sendMessage(tab.id!, {
      type: "get-html",
    });

    return {
      content: html,
      url,
    };
  }
});

chrome.runtime.onMessage.addListener(function (request) {
  if (request.type == "new-page") {
    lightrailClient.sendEvent({ name: "chrome:new-page", data: null });
  }
});
