"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const lightrail_sdk_1 = require("lightrail-sdk");
const socket_io_client_1 = require("socket.io-client");
const fs_1 = require("fs");
const path_1 = require("path");
let lightrailClient = new lightrail_sdk_1.LightrailClient("vscode-client", (0, socket_io_client_1.io)("ws://localhost:1218"));
function activate(context) {
    const provider = new ProposalConfirmationViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(ProposalConfirmationViewProvider.viewType, provider));
    lightrailClient.registerEventListener("vscode:get-selection", async () => {
        return {
            content: vscode.window.activeTextEditor?.document.getText(vscode.window.activeTextEditor.selection),
            file: vscode.window.activeTextEditor?.document.fileName,
            range: vscode.window.activeTextEditor?.selection,
        };
    });
    lightrailClient.registerEventListener("vscode:get-selected-files", async () => {
        const originalClipboard = await vscode.env.clipboard.readText();
        await vscode.commands.executeCommand("copyFilePath");
        const folder = await vscode.env.clipboard.readText();
        await vscode.env.clipboard.writeText(originalClipboard);
        return folder.split("\n");
    });
    lightrailClient.registerEventListener("vscode:get-editing-file", async () => {
        return vscode.window.activeTextEditor?.document.fileName;
    });
    lightrailClient.registerEventListener("vscode:codegen-proposals", async ({ data }) => {
        const proposals = data;
        await provider.propose(proposals);
        vscode.commands.executeCommand("lightrail.proposal-confirmation.focus");
    });
    vscode.window.onDidChangeTextEditorSelection((event) => {
        const selection = event.selections[0];
        if (!selection.isEmpty) {
            lightrailClient.sendEvent({
                name: "vscode:new-selection",
                data: null,
            });
        }
    });
    // Send heartbeat event every 2 seconds
    setInterval(() => {
        lightrailClient.sendEvent({
            name: "vscode:heartbeat",
            data: null,
        });
    }, 2000);
}
exports.activate = activate;
class ProposalConfirmationViewProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, context, _token) {
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
                    const proposedContents = (0, fs_1.readFileSync)(data.proposal[1], "utf8");
                    vscode.commands.executeCommand("workbench.action.closeActiveEditor");
                    (0, fs_1.mkdirSync)((0, path_1.dirname)(data.proposal[0]), { recursive: true });
                    (0, fs_1.writeFileSync)(data.proposal[0], proposedContents);
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
                    if (!(0, fs_1.existsSync)(leftFile.fsPath)) {
                        leftFile = vscode.Uri.parse(`untitled:${new Date().getTime()}`);
                    }
                    vscode.commands.executeCommand("vscode.diff", leftFile, newUri, "Lightrail Proposal");
                }
            }
        });
    }
    async propose(proposals) {
        if (this._view) {
            this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
            this._view.webview.postMessage({ type: "propose", proposals });
        }
    }
    _getHtmlForWebview(webview) {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "main.js"));
        const stylesUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "styles.css"));
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
        <link href="${stylesUri}" rel="stylesheet">
				<title>Lightrail Proposal</title>
			</head>
			<body>
        <div id="proposals-container" style="display: none">
          <h2 style="margin: 1rem">        
            Lightrail proposed this change for:
          </h2>
          <div style="margin: 1rem" id="proposal-file-name"></div>
          <button style="margin: 1rem" id="accept-button">Accept</button>
          <button class="secondary" style="margin: 1rem" id="reject-button">Reject</button>
          <div>
            Proposal <span id="proposal-counter"></span>.
          </div>
        </div>
        <div id="no-proposals-message" style="margin: 1rem; opacity: 0.5">
          No proposal currently active
        </div>
        <script src="${scriptUri}"></script>
			</body>
			</html>`;
    }
}
ProposalConfirmationViewProvider.viewType = "lightrail.proposal-confirmation";
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map