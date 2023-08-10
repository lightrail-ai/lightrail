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
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const lightrail_sdk_1 = require("lightrail-sdk");
const socket_io_client_1 = require("socket.io-client");
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
let lightrailClient = new lightrail_sdk_1.LightrailClient("vscode-client", (0, socket_io_client_1.io)("ws://localhost:1218"));
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "lightrail-vscode" is now active!');
    lightrailClient.registerEventListener("vscode:get-selection", async () => {
        console.log("get selection");
        return vscode.window.activeTextEditor?.document.getText(vscode.window.activeTextEditor.selection);
    });
    lightrailClient.registerEventListener("vscode:get-selected-files", async () => {
        const originalClipboard = await vscode.env.clipboard.readText();
        await vscode.commands.executeCommand("copyFilePath");
        const folder = await vscode.env.clipboard.readText();
        await vscode.env.clipboard.writeText(originalClipboard);
        return folder.split("\n");
    });
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map