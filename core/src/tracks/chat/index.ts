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
      name: "Send to AI",
      description: "Send a message to LLM",
      colors: ["#74a89b", "#ececf1"],
      args: [],
      icon: "circle-up",
      async rendererHandler(prompt, _args) {
        lightrail.ui?.setView("chat");
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
      },
    });

    lightrail.registerAction({
      name: "Reset Chat",
      description: "Clear Chat History",
      colors: ["#74a89b", "#ececf1"],
      args: [],
      icon: "message",
      async rendererHandler(_prompt, _args) {
        lightrail.ui?.setView("chat");
        lightrail.ui?.chat.setHistory([]);
      },
      async mainHandler(_prompt, _args) {},
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
