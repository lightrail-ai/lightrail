import { LightrailTrack, HumanMessage } from "lightrail-sdk";
import { marked } from "marked";

declare function require(module: string): any;

let state = {
  stdout: "",
  stderr: "",
};

export default {
  name: "shell", // Everything except name is optional
  tokens: [],
  actions: [
    {
      name: "Write a Script",
      description: "Write (& optionally run) a shell script",
      color: "#006400",
      icon: "file-lines",
      args: [],
      async handler(handle, userPrompt) {
        handle.sendMessageToRenderer("new-message", {
          sender: "user",
          content: userPrompt._json,
        });

        await userPrompt.hydrate(handle);

        userPrompt.appendText(
          "\n\nOutput only a code-block containing a bash shell script. Any descriptions should be comments in the shell script. Do not output anything outside of the code block. The shell script must be executable as-is."
        );

        const response = await handle.llm.chat.converse(
          // @ts-ignore
          [new HumanMessage(userPrompt.toMessage())],
          {
            callbacks: [
              {
                handleLLMNewToken: (token) =>
                  handle.sendMessageToRenderer("new-token", token),
                handleLLMError: (error) => {
                  throw new Error(error.message);
                },
              },
            ],
          }
        );
        handle.sendMessageToRenderer("new-message", {
          sender: "ai",
          content: response.content,
        });
      },
    },
  ],
  handlers: {
    main: {
      "run-script": async (handle, script) => {
        const path = await handle.fs.writeTempFile(script, "script.sh");
        const { exec } = require("child_process");
        handle.logger.info("Running Shell Script...");
        exec(`bash ${path}`, (error, stdout, stderr) => {
          if (error) {
            console.log(`exec error: ${error}`);
            handle.sendMessageToRenderer("run-error", error);
          }
          handle.sendMessageToRenderer("run-output", stdout);
          handle.sendMessageToRenderer("run-error", stderr);
        });
      },
    },
    renderer: {
      "run-output": async (rendererHandle, output) => {
        state.stdout += output;
        rendererHandle.ui?.controls.setControls([
          {
            type: "output",
            ...state,
          },
        ]);
      },
      "run-error": async (rendererHandle, output) => {
        state.stderr += output;
        rendererHandle.ui?.controls.setControls([
          {
            type: "output",
            ...state,
          },
        ]);
      },
      "new-token": async (rendererHandle, token) =>
        rendererHandle.ui?.chat.setPartialMessage((prev) =>
          prev ? prev + token : token
        ),
      "new-message": async (rendererHandle, message) => {
        rendererHandle.ui?.chat.setPartialMessage(null);
        rendererHandle.ui?.chat.setHistory((prev) => [...prev, message]);

        if (message.sender === "ai") {
          const tokens = marked.lexer(message.content);
          const script = tokens.find((token) => token.type === "code");

          if (script && script.type === "code") {
            rendererHandle.ui?.controls.setControls([
              {
                type: "buttons",
                buttons: [
                  {
                    label: "Discard",
                    onClick: () => {
                      state = {
                        stdout: "",
                        stderr: "",
                      };
                      rendererHandle.ui?.reset();
                    },
                  },
                  {
                    label: "Run",
                    color: "primary",
                    onClick: () => {
                      state = {
                        stdout: "",
                        stderr: "",
                      };
                      rendererHandle.sendMessageToMain(
                        "run-script",
                        script.text
                      );
                    },
                  },
                ],
              },
            ]);
          }
        }
      },
    },
  },
} satisfies LightrailTrack;
