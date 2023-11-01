# Lightrail - The Universal AI Command Bar

[![Discord](https://img.shields.io/discord/1126247706789167264?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/57bNyxgb7g)

<div style="text-align: center; padding: 24px 0">
    <img src="./assets/screenshot5-with-bg.jpeg" height="280" />
</div>

[**Demo Screencast**](https://vimeo.com/861792302?share=copy) | [**Documentation**](https://docs.lightrail.ai)

## Description

🚧 Lightrail is currently pre-release - expect (and report) bugs / inconsistencies! 🚧

Lightrail is an open-source AI command bar that seeks to simplifies software development. It is designed to be a general-purpose, extensible platform for integrating LLM-based tooling into engineering/development workflows. It does this by focusing on three components of working with LLMs: Providing sources of context, constructing effective prompts, and interfacing with external services. Lightrail accomplishes these goals through an extension framework called Tracks. Tracks can provide `Tokens`, which are sources of dynamically generated context for a prompt, as well as `Actions`, which are functions that can modify a prompt, send it to an LLM, and use the LLM's response to execute functionality. Currently available Tracks include integrations with VS Code, Jupyterlab, PostgreSQL, and more.

## Installation

To get started, just download the appropriate Lightrail package for your operating system:

- OS X (Apple Silicon / M1 / M2): [lightrail-core-arm64.dmg](https://github.com/lightrail-ai/lightrail/releases/latest/download/lightrail-core-arm64.dmg)
- OS X (Intel): [lightrail-core-x64.dmg](https://github.com/lightrail-ai/lightrail/releases/latest/download/lightrail-core-x64.dmg)
- Ubuntu: [lightrail-core.deb](https://github.com/lightrail-ai/lightrail/releases/latest/download/lightrail-core.deb)
- Fedora: [lightrail-core.rpm](https://github.com/lightrail-ai/lightrail/releases/latest/download/lightrail-core.rpm)

## Usage

- Launch Lightrail initially as you would normally start an application on your platform (i.e. from your application launcher). Consider adding it to your startup items ([OS X](https://support.apple.com/guide/mac-help/open-items-automatically-when-you-log-in-mh15189/mac), [Gnome](https://help.gnome.org/users/gnome-help/stable/shell-apps-auto-start.html.en)), so that it automatically starts on boot.
- When Lightrail is running on your system, it can be activated at any time by pressing the keyboard combination `Cmd/Ctrl-Shift-Space`.
- Use the up- and down-arrow keys to browse actions, and hit `enter/return` to select one (while in 'Choose an action' mode).
- To change the action afterwards, press `esc` or `@`, or click on the current action
- After selecting an action, enter the prompt (or any other required arguments). Your prompt can include tokens, which pull in additional context from external sources:
  - Type the forward-slash at any point in a prompt (`/`) to open the Tokens menu. Use the arrow keys to select a token and hit enter to insert that token into your prompt.
  - In general, try to be explicit about what sources of content you'd like to include for best results.
- `Cmd/Ctrl-Up` and `Cmd/Ctrl-Down` cycle through the prompt history.
- By default, the application uses a lightrail.ai-provided gateway to access OpenAI's LLMs. If you'd like to switch to using your own API key and accessing the OpenAI API directly, you can configure that in Settings (click the gear icon in the prompt input box).

## Troubleshooting

Some common issues, and how to fix them:

- **Q: I get `i is not iterable` as an error**
- **A:** This occurs when the action expects a prompt but one isn't provided. Almost all actions currently available only work if the user has entered a prompt, so make sure you're providing one before you hit `enter/return`.
- **Q: I'm on Linux and the keyboard shortcut to open Lightrail isn't working for me**
- **A:** If you're using Wayland, this is a known bug, caused by [this issue](https://github.com/electron/electron/issues/15863). Currently, the only fix is using your system's settings to manually assign a keyboard shortcut to launching Lightrail. If you have any idea how to work-around this bug, I'd love to hear it!

Any other issues? Let me know [on Discord](https://discord.gg/57bNyxgb7g) or [make an issue](https://github.com/lightrail-ai/lightrail/issues) and I'll address it ASAP!

## Writing Tracks & Clients

The `lightrail-sdk` npm package makes it easy to create additional tracks and extend Lightrail's functionality, or to make Clients that integrate Lightrail with other platforms.
For thorough documentation on creating Tracks & Clients, [see our developer documentation here](https://docs.lightrail.ai/sdk/intro).

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
