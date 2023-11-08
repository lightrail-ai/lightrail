import type { LightrailTrack } from "lightrail-sdk";

let state: any = {
  screenshotResolutionFunction: null,
  prompt: null,
  sources: [],
};

export default <LightrailTrack>{
  name: "system",
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
    {
      name: "screenshot",
      description: "Screenshot of a window",
      color: "#999999",
      args: [],
      hydrate(mainHandle, args, prompt) {
        const { desktopCapturer, systemPreferences } = require("electron");
        const jsonStorage = require("electron-json-storage");

        const settings: any = jsonStorage.getSync("settings");

        if (!settings?.model?.includes("vision")) {
          throw new Error(
            "Including screenshots is only supported when using a vision model. To use this feature, please open the Settings page (click the gear icon below then navigate to 'Settings'), set the Provider to 'openai', and select the 'gpt-4-vision-preview' model. Make sure to provide your own API key as well."
          );
        }

        prompt.appendText("the attached screenshot");

        return new Promise((resolve) => {
          desktopCapturer
            .getSources({
              types: ["window"],
              thumbnailSize: {
                height: 1080,
                width: 1920,
              },
            })
            .then((sources) => {
              state.sources = sources;
              state.screenshotResolutionFunction = resolve;
              state.prompt = prompt;
              mainHandle.sendMessageToRenderer(
                "system:prompt-for-screenshot-window",
                sources.map(({ id, name }) => ({ id, name })),
                true
              );
            });
        });
      },
      render(args) {
        return [];
      },
    },
  ],

  handlers: {
    renderer: {
      "reset-chat": async (rendererHandle) => rendererHandle.ui?.reset(),
      "system:prompt-for-screenshot-window": async (
        rendererHandle,
        sources
      ) => {
        if (sources.length === 1) {
          rendererHandle.sendMessageToMain(
            "system:select-screenshot",
            sources[0].id,
            true
          );
        } else {
          rendererHandle.ui?.controls.setControls([
            {
              type: "buttons",
              label: "Select/confirm window to screenshot:",
              buttons: sources.map((s) => ({
                label: s.name,
                onClick: () => {
                  rendererHandle.ui?.controls.setControls([]);
                  rendererHandle.sendMessageToMain(
                    "system:select-screenshot",
                    s.id,
                    true
                  );
                },
              })),
            },
          ]);
        }
      },
    },
    main: {
      "system:select-screenshot": async (_mainHandle, sourceId) => {
        const source = state.sources.find((s) => s.id === sourceId);
        const dataUrl = source.thumbnail.toDataURL();

        state.prompt.appendContextItem({
          title: "Screenshot",
          content: dataUrl,
          type: "image",
        });

        state.screenshotResolutionFunction?.();
      },
    },
  },
};
