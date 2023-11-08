import { LightrailControl } from "lightrail-sdk";
import { trpcClient } from "./util/trpc-client";
import { loadTracks } from "./util/track-admin";

let state: {
  clientsNeeded: string[];
  tracksToInstall: string[];
} = {
  clientsNeeded: [],
  tracksToInstall: [],
};

function getNextStep() {
  return state.clientsNeeded.shift() || "complete";
}

interface OnboardingStep {
  name: string;
  content?: string; // markdown
  disableInput?: boolean;
  getControls: (
    next: () => void,
    goto: (name: string) => void
  ) => LightrailControl[];
}

export interface OnboardingScript {
  steps: OnboardingStep[];
}

export const mainOnboardingScript = {
  steps: [
    {
      name: "welcome",
      disableInput: true,
      content: `
## Welcome to Lightrail!

Lightrail makes it easy for you to integrate AI/LLM workflows into the tools you already use. It's always available, and you can open it at any time by pressing **Ctrl/⌘-Shift-Space**.

Click **Continue** to proceed with a brief tutorial / setup to prepare Lightrail for your specific usecases.`,
      getControls: (next) => [
        {
          type: "buttons",
          buttons: [
            {
              label: "Continue →",
              onClick: next,
            },
          ],
        },
      ],
    },
    {
      name: "actions",
      content: `
### Actions

To have Lightrail do something for you, first select an **action** that matches your intent. Actions are the commands or 'verbs' of Lightrail. 

To **select** an action below, use the **arrow keys** (↑ and ↓) to highlight the action you want then press **enter/return**. You can also type to filter the list of actions.

Once an action is selected, to **change** the current action, either type **@** or **click** on the current action.

You might only see a few actions now, but we'll enable way more in a couple steps! For now, select the **Send to AI** action, then click **Continue**.`,
      getControls: (next) => [
        {
          type: "buttons",
          buttons: [
            {
              label: "Continue →",
              onClick: next,
            },
          ],
        },
      ],
    },
    {
      name: "tokens",
      content: `
  ### Tokens
  
  Most actions in Lightrail require a prompt, where you tell Lightrail the specific details it needs to carry out the action. For example, the **Send to AI** action needs a message to send to the AI, while an **Insert at Cursor** action would need a description of the text to generate and insert.

  You can just type text to fill out the prompt, but you can also use special \`tokens\` to pull in information from other sources, like files or pages you have open in other applications. 

  While you're filling out the prompt, type **/** to open the token selection menu, then use the **arrow keys** and **enter/return** to select a token. Some tokens require additional info/arguments, which you'll be prompted for after you select a token. 

  Try opening/navigating the Tokens menu below (note, actions can only be run after setup concludes), then click **Continue**.`,
      getControls: (next) => [
        {
          type: "buttons",
          buttons: [
            {
              label: "Continue →",
              onClick: next,
            },
          ],
        },
      ],
    },
    {
      name: "tracks",
      disableInput: true,
      content: `
### Lightrail Tracks

So far, it might not seem like Lightrail can do very much. That's because most of Lightrail's functionality comes from our extension system, called \`Tracks\`. 

Tracks provide both actions and tokens, and help integrate Lightrail with other software on your machine. Lets get you set up with the Tracks that are relevant to you. Select the ones below that sound interesting, then click **Continue**.

Later, new Tracks can be installed from the Preferences page at any time (click on the Gear icon in the top right of the input box).`,
      getControls: (next) => [
        {
          type: "checkboxes",
          label: "Select the functionality you'd like to enable:",
          options: [
            {
              name: "Files",
              value: "files",
              description:
                "Have Lightrail read and write specified files/paths on your computer",
            },
            {
              name: "Google Chrome",
              value: "chrome",
              description: "Pull content from webpages open in Google Chrome",
            },
            {
              name: "VS Code",
              value: "vscode",
              description:
                "Have Lightrail edit or read files/projects in VS Code",
            },
            {
              name: "PostgresQL",
              value: "sql",
              description:
                "Have Lgithrail write SQL & Interact with a PostgresQL database",
            },
            {
              name: "Data Science",
              value: "datasci",
              description:
                "Let Lightrail edit & debug JupyterLab or RStudio notebooks.",
            },
            {
              name: "Shell (Bash)",
              value: "shell",
              description: "Have Lightrail write & run bash scripts/commands.",
            },
          ],
          onSubmit(options) {
            if (options.length < 1) {
              return alert("Please select at least one Track to enable.");
            }
            const selectedTracks = options.map((o) => o.value);
            state.tracksToInstall = selectedTracks;
            state.clientsNeeded = ["vscode", "datasci", "chrome"].filter((t) =>
              selectedTracks.includes(t)
            );

            next();
          },
          submitLabel: "Continue →",
        },
      ],
    },
    {
      name: "installing-tracks",
      disableInput: true,
      getControls: (_, goto) => [
        {
          type: "loading",
          label: "Please wait, installing & enabling selected Tracks...",
          async task() {
            const repository = (await trpcClient.tracks.repository.query())
              .tracks;
            let trackPaths: string[] = [];
            for (const trackName of state.tracksToInstall) {
              trackPaths = await trpcClient.tracks.install.mutate(
                repository[trackName].url
              );
            }
            await loadTracks(trackPaths);
            goto(getNextStep());
          },
        },
      ],
    },
    {
      name: "chrome",
      content: `
### Connect to Google Chrome

Since you selected the Google Chrome Track, you'll need to install Lightrail's Google Chrome extension so that Lightrail can interact with Google Chrome. This extension is currently pre-release, so it isn't available on the Chrome Web Store and needs to be installed manually. 

To install, follow these directions:

1. Download this file: [lightrail-chrome.zip](https://github.com/lightrail-ai/lightrail/releases/latest/download/lightrail-chrome.zip)
2. Unzip \`lightrail-chrome.zip\`. It should contain a folder called \`dist\`.
3. In Chrome, go to the URL \`chrome://extensions\`. There should be a toggle in the upper-right labelled \`Developer Mode\`. Toggle it so that \`Developer Mode\` is enabled.
4. Click the **Load unpacked** button, and select the \`dist\` folder you unpacked.

Once the extension is installed, open a new page in Chrome and wait until the indicator below shows that Lightrail has connected to Chrome. Then, click **Continue**.`,
      disableInput: true,
      getControls: (_, goto) => [
        {
          type: "client-status",
          client: "chrome-client",
          continueLabel: "Continue →",
          skipLabel: "Skip this step, I'll do it later",
          onContinue: () => {
            goto(getNextStep());
          },
          onSkip: () => {
            goto(getNextStep());
          },
        },
      ],
    },
    {
      name: "vscode",
      content: `
### Connect to VS Code

Since you selected the VS Code Track, you'll need to install the [Lightrail VS Code Extension](https://marketplace.visualstudio.com/items?itemName=lightrail.lightrail-vscode).
This allows Lightrail to interface with VS Code. 

To install, open VS Code, press Ctrl/⌘-p to launch Quick Open, then paste the following command and press enter/return:  

\`\`\`
ext install lightrail.lightrail-vscode
\`\`\`

Once the extension is installed, restart VS Code and wait until the indicator below shows that Lightrail has connected to VS Code (you might need to start editing a file in VS Code). Then, click **Continue**.`,
      disableInput: true,
      getControls: (_, goto) => [
        {
          type: "client-status",
          client: "vscode-client",
          continueLabel: "Continue →",
          skipLabel: "Skip this step, I'll do it later",
          onContinue: () => {
            goto(getNextStep());
          },
          onSkip: () => {
            goto(getNextStep());
          },
        },
      ],
    },
    {
      name: "datasci",
      content: `
### Connect to JupyterLab

Since you selected the DataSci Track, you can install the [JupyterLab extension](https://pypi.org/project/lightrail-jupyterlab/) to allow Lightrail to interact with JupyterLab. If you skip this step, you'll only be able to Data Science actions on notebook files specified by path, resulting in a less integrated experience.

To install, go to the Extensions pane in JupyterLab, search for \`lightrail-jupyterlab\`, click Install, and refresh the page. If \`lightrail-jupyterlab\` doesn't show up, you might be running an out-of-date version of JupyterLab—try updating to the latest version.

Once the extension is installed, open a iPython notebook in JupyterLab & wait until the indicator below shows that Lightrail has connected to JupyterLab. Then, click **Continue**.`,
      disableInput: true,
      getControls: (_, goto) => [
        {
          type: "client-status",
          client: "jupyterlab-client",
          continueLabel: "Continue →",
          skipLabel: "Skip this step, I'll do it later",
          onContinue: () => {
            goto(getNextStep());
          },
          onSkip: () => {
            goto(getNextStep());
          },
        },
      ],
    },
    {
      name: "complete",
      content: `
## Setup Complete! 🎉

You're all set up! Want more info on how to get the most out of Lightrail? Run into any issues? Feature requests? Check out:

* [Our Docs](https://docs.lightrail.ai)
* [Our Discord](https://discord.gg/WPCCe7jZuS)`,
      disableInput: true,
      getControls: (next) => [
        {
          type: "buttons",
          buttons: [
            {
              label: "✓ Finish Setup ",
              onClick: async () => {
                await trpcClient.onboarding.complete.mutate();
                next();
              },
            },
          ],
        },
      ],
    },
  ],
} satisfies OnboardingScript;
