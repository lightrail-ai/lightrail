# Lightrail - The Universal AI Command Bar

[![](https://dcbadge.vercel.app/api/server/57bNyxgb7g)](https://discord.gg/57bNyxgb7g)

<div style="text-align: center; padding: 24px 0">
    <img src="./assets/screenshot1.png" height="280" />
</div>

## Description

🚧 Lightrail is currently pre-release - expect (and report) bugs / inconsistencies! 🚧

Lightrail is an open-source AI command bar that seeks to simplifies software development. It is designed to be a general-purpose, extensible platform for integrating LLM-based tooling into engineering/development workflows. It does this by focusing on three components of working with LLMs: Providing sources of context, constructing effective prompts, and interfacing with external services. Lightrail accomplishes these goals through an extension framework called Tracks. Tracks can provide `Tokens`, which are sources of dynamically generated context for a prompt, as well as `Actions`, which are functions that can modify a prompt, send it to an LLM, and use the LLM's response to execute functionality. All Lightrail functionality is delivered via the Tracks system, so a plain install of the Lightrail Core is essentially nonfunctional. Therefore, Lightrail's default installation includes a few commonly used tracks (Chat, VSCode, Chrome). More tracks are in development and will be installable through the Lightrail application.

## Installation

Lightrail is currently pre-release, so installation requires a few steps. For VSCode and Chrome integration to function, the VSCode and Chrome extensions must be installed separately.

1. **Download & install the appropriate Lightrail Core package for your operating system:**
   - OS X: [lightrail-core.dmg](https://github.com/lightrail-ai/lightrail/releases/latest/download/lightrail-core.dmg)
   - Ubuntu: [lightrail-core.deb](https://github.com/lightrail-ai/lightrail/releases/latest/download/lightrail-core.deb)
   - Fedora: [lightrail-core.rpm](https://github.com/lightrail-ai/lightrail/releases/latest/download/lightrail-core.rpm)
2. **Install the VSCode Extension:**
   1. Download this file: [lightrail-vscode.vsix](https://github.com/lightrail-ai/lightrail/releases/latest/download/lightrail-vscode.vsix)
   2. In VSCode, open the Extensions pane and click the More Actions button in the upper-right (`…`) and select `Install from VSIX...`
   3. Select the file you just downloaded to install the Lightrail integration
   4. Done! For more details / an alternative way to install from a VSIX file, see: [https://code.visualstudio.com/docs/editor/extension-marketplace#\_install-from-a-vsix](https://code.visualstudio.com/docs/editor/extension-marketplace#_install-from-a-vsix)
3. **Install the Chrome Extension:**
   1. Download this file: [lightrail-chrome.zip](https://github.com/lightrail-ai/lightrail/releases/latest/download/lightrail-chrome.zip)
   2. Unzip `lightrail-chrome.zip`. It should contain a folder called `dist`.
   3. In Chrome, go to `chrome://extensions`. There should be a toggle in the upper-right labelled `Developer Mode`. Toggle it so that `Developer Mode` is enabled.
   4. Click the `Load unpacked` button, and select the `dist` folder (from step 2).
   5. Done! For more details / pictures, see: [https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked)
4. **Set up Lightrail**
   1. Launch the lightrail program, click the gear icon in the upper-right corner, and enter a valid OpenAI API key. If you'd like, you can also select the model you'd like to default to.
   2. Done! See 'Usage' below for more on using Lightrail.

## Usage

- Launch Lightrail initially as you would normally start an application on your platform. Consider adding it to your startup items, so that it automatically starts on boot.
- When Lightrail is running on your system, it can be activated at any time by pressing the keyboard combination `Cmd/Ctrl-Shift-Space`.
- Enter text in the prompt, use the up- and down-arrow keys to select an action, and hit `enter/return` to send the prompt to the action.
- Type the forward-slash at any point in a prompt (`/`) to open the Tokens menu. Use the arrow keys to select a token and hit enter to insert that token into your prompt.
  - Tokens make it easy to pull in additional sources of context for your prompt. In general, try to be explicit about what sources of content you'd like to include for best results.

## Writing Tracks

_Documentation Coming Soon_

## Contributing

We'd love to have your contributions added to Lightrail! If you would like to contribute, please follow this guidelines:

- Fork the repository
- Create a new branch: `git checkout -b feature/my-feature`
- Make your changes
- Commit your changes: `git commit -m "Add new feature"`
- Push to the branch: `git push origin feature/my-feature`
- Submit a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more details.
