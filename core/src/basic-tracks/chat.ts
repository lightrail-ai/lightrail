import type { LightrailTrack } from "lightrail-sdk";
import { HumanMessage } from "langchain/schema";

export default <LightrailTrack>{
  name: "chat",
  actions: [
    {
      name: "Send to AI",
      description: "Send a message to LLM",
      color: "#74a89b",
      args: [],
      icon: "circle-up",
      async handler(mainHandle, prompt) {
        mainHandle.sendMessageToRenderer("new-message", {
          sender: "user",
          content: prompt._json,
        });
        await prompt.hydrate(mainHandle);
        const response = await mainHandle.llm.chat.converse(
          [new HumanMessage(prompt.toString())],
          {
            callbacks: [
              {
                handleLLMNewToken: (token) =>
                  mainHandle.sendMessageToRenderer("new-token", token),
                handleLLMError: (error) => {
                  throw new Error(error.message);
                },
              },
            ],
          }
        );
        mainHandle.sendMessageToRenderer("new-message", {
          sender: "ai",
          content: response.content,
        });
      },
    },
  ],
  handlers: {
    renderer: {
      "new-token": async (rendererHandle, token) =>
        rendererHandle.ui?.chat.setPartialMessage((prev) =>
          prev ? prev + token : token
        ),
      "new-message": async (rendererHandle, message) => {
        rendererHandle.ui?.chat.setPartialMessage(null);
        rendererHandle.ui?.chat.setHistory((prev) => [...prev, message]);
      },
    },
  },
};
