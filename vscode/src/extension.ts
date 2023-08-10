// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { LightrailClient } from "lightrail-sdk";
import { io } from "socket.io-client";
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

let lightrailClient = new LightrailClient(
  "vscode-client",
  io("ws://localhost:1218") as any
);

export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "lightrail-vscode" is now active!'
  );

  lightrailClient.registerEventListener("vscode:get-selection", async () => {
    console.log("get selection");
    return vscode.window.activeTextEditor?.document.getText(
      vscode.window.activeTextEditor.selection
    );
  });

  lightrailClient.registerEventListener(
    "vscode:get-selected-files",
    async () => {
      const originalClipboard = await vscode.env.clipboard.readText();
      await vscode.commands.executeCommand("copyFilePath");
      const folder = await vscode.env.clipboard.readText();
      await vscode.env.clipboard.writeText(originalClipboard);

      return folder.split("\n");
    }
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
