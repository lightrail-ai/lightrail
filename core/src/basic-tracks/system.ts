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
      placeholder: "Press Enter/Return to Reset",
    },
  ],
  tokens: [
    {
      name: "clipboard",
      description: "Clipboard Contents",
      color: "#999999",
      args: [],
      async hydrate(mainHandle, args, prompt) {
        const { clipboard } = require("electron");
        const content = clipboard.readText();

        prompt.appendContextItem({
          title: "Clipboard Contents",
          content,
          type: "text",
        });

        prompt.appendText("the Clipboard Contents");
      },
      render(args) {
        return [];
      },
    },
  ],
  handlers: {
    renderer: {
      "reset-chat": async (rendererHandle) => rendererHandle.ui?.reset(),
    },
  },
};
