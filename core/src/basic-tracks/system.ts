import type { LightrailTrack } from "lightrail-sdk";
import { HumanMessage } from "langchain/schema";

export default <LightrailTrack>{
  name: "lightrail",
  actions: [
    {
      name: "Reset Conversation",
      description: "Clear History",
      color: "#999999",
      args: [],
      icon: "rectangle-xmark",
      async handler(mainHandle, _prompt) {
        mainHandle.llm.chat.reset();
        mainHandle.sendMessageToRenderer("reset-chat");
      },
    },
  ],
  handlers: {
    renderer: {
      "reset-chat": async (rendererHandle) => rendererHandle.ui?.reset(),
    },
  },
};
