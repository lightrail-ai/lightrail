import * as vscode from "vscode";
import { LightrailClient } from "lightrail-sdk";
import { io } from "socket.io-client";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";
let lightrailClient = new LightrailClient(
  "vscode-client",
  io("ws://localhost:1218") as any
);

export function activate(context: vscode.ExtensionContext) {
  const provider = new ProposalConfirmationViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      ProposalConfirmationViewProvider.viewType,
      provider
    )
  );

  lightrailClient.registerHandler("get-selection", async () => {
    return {
      content: vscode.window.activeTextEditor?.document.getText(
        vscode.window.activeTextEditor.selection
      ),
      file: vscode.window.activeTextEditor?.document.fileName,
      range: vscode.window.activeTextEditor?.selection,
    };
  });

  lightrailClient.registerHandler("get-selected-files", async () => {
    const originalClipboard = await vscode.env.clipboard.readText();
    await vscode.commands.executeCommand("copyFilePath");
    const folder = await vscode.env.clipboard.readText();
    await vscode.env.clipboard.writeText(originalClipboard);

    return folder.split("\n");
  });

  lightrailClient.registerHandler("get-editing-file", async () => {
    return vscode.window.activeTextEditor?.document.fileName;
  });

  lightrailClient.registerHandler(
    "codegen-proposals",
    async (proposals: [string, string][]) => {
      await provider.propose(proposals);
      vscode.commands.executeCommand("lightrail.proposal-confirmation.focus");
    }
  );

  vscode.window.onDidChangeTextEditorSelection((event) => {
    const selection = event.selections[0];
    if (!selection.isEmpty) {
      lightrailClient.sendMessageToMain(
        "vscode-client",
        "new-selection",
        null,
        true
      );
    }
  });
}

class ProposalConfirmationViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "lightrail.proposal-confirmation";

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case "proposal-accepted": {
          console.log("Accepted");
          const proposedContents = readFileSync(data.proposal[1], "utf8");
          vscode.commands.executeCommand("workbench.action.closeActiveEditor");
          mkdirSync(dirname(data.proposal[0]), { recursive: true });
          writeFileSync(data.proposal[0], proposedContents);
          break;
        }
        case "proposal-rejected": {
          console.log(data.proposal);
          console.log("Rejected");
          vscode.commands.executeCommand("workbench.action.closeActiveEditor");
          break;
        }
        case "proposal-opened": {
          console.log("Opened");
          let origUri = vscode.Uri.file(data.proposal[0]);
          let newUri = vscode.Uri.file(data.proposal[1]);

          // Check if origUri points to an existing file
          let leftFile = origUri;
          if (!existsSync(leftFile.fsPath)) {
            leftFile = vscode.Uri.parse(`untitled:${new Date().getTime()}`);
          }

          vscode.commands.executeCommand(
            "vscode.diff",
            leftFile,
            newUri,
            "Lightrail Proposal"
          );
        }
      }
    });
  }

  public async propose(proposals: [string, string][]) {
    if (this._view) {
      this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
      this._view.webview.postMessage({ type: "propose", proposals });
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.js")
    );

    const stylesUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "styles.css")
    );

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
        <link href="${stylesUri}" rel="stylesheet">
				<title>Lightrail Proposal</title>
			</head>
			<body style="width: 100%; height: 100%">
        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
          <div id="proposals-container" style="display: none">
            <h2 style="">        
              Lightrail proposed this change for:
            </h2>
            <div style="margin-top: 1rem" id="proposal-file-name"></div>
            <button style="margin-top: 1rem" id="accept-button">Accept</button>
            <button class="secondary" style="margin-left: 1rem; margin-top: 1rem" id="reject-button">Reject</button>
            <div style="margin-top:1rem">
              Proposal <span id="proposal-counter"></span>.
            </div>
          </div>
          <div id="no-proposals-message" style="margin: 1rem; opacity: 0.5">
            No proposal currently active
          </div>
        </div>
        <script src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
