import type { ChatRequestMessage, ChatResponse } from "llm-api";
import type { Lightrail, LightrailTrack } from "lightrail-sdk";

export default class Track implements LightrailTrack {
  lightrail: Lightrail;

  constructor(lightrail) {
    this.lightrail = lightrail;
  }

  async init() {
    const lightrail = this.lightrail;

    let chatState: {
      lastResponse: ChatResponse | null;
    } = {
      lastResponse: null,
    };

    lightrail.registerAction({
      name: "Reset Chat",
      description: "Clear Chat History",
      color: "#74a89b",
      args: [],
      icon: "message",
      async rendererHandler(_prompt, _args) {
        lightrail.ui?.reset();
      },
      async mainHandler(_prompt, _args) {
        chatState.lastResponse = null;
      },
    });

    lightrail.registerAction({
      name: "Send to AI",
      description: "Send a message to LLM",
      color: "#74a89b",
      args: [],
      icon: "circle-up",
      async rendererHandler(prompt, _args) {
        lightrail.ui?.chat.setHistory((prev) => [
          ...prev,
          {
            sender: "user",
            content: prompt,
          },
        ]);
      },
      async mainHandler(prompt, _args) {
        const { EventEmitter } = require("events");
        const llmClient = lightrail.getLLMClient()!;
        const ee = new EventEmitter();
        ee.on("data", (data) => {
          lightrail.sendEvent({
            name: "chat:token",
            data: data,
          });
        });

        const chatMessage: ChatRequestMessage = {
          role: "user",
          content: prompt,
        };
        try {
          const response = await (chatState.lastResponse
            ? chatState.lastResponse.respond(chatMessage, {
                events: ee,
              })
            : await llmClient.chatCompletion([chatMessage], {
                events: ee,
              }));
          chatState.lastResponse = response;
          lightrail.sendEvent({
            name: "chat:response",
            data: response.content,
          });
        } catch (e) {
          console.error(e);
          lightrail.sendEvent({
            name: "chat:response",
            data: "--- LLM Error, please check logs ---",
          });
        }
      },
    });

    if (lightrail.isRenderer) {
      lightrail.registerEventListener("chat:response", async (event) => {
        const response = event.data;
        lightrail.ui?.chat.setPartialMessage(null);
        lightrail.ui?.chat.setHistory((prev) => [
          ...prev,
          {
            sender: "ai",
            content: response,
          },
        ]);
      });
      lightrail.registerEventListener("chat:token", async (event) => {
        const token = event.data;
        lightrail.ui?.chat.setPartialMessage((prev) =>
          prev ? prev + token : token
        );
      });
    }
  }
}
