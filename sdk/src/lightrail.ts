import type { MainLogger } from "electron-log";
import type { RendererLogger } from "electron-log";
import type { Dispatch, SetStateAction } from "react";
import type { BaseLanguageModelCallOptions } from "langchain/base_language";
import type { BaseMessage } from "langchain/schema";
import type { BaseChatModel } from "langchain/chat_models/base";
import type { TokensList } from "marked";

export type TokenArgument = {
  name: string;
  description: string;
} & (
  | { type: "string" }
  | { type: "number" }
  | { type: "boolean" }
  | { type: "choice"; choices: TokenArgumentOption[] }
  | { type: "path" }
  | {
      type: "history";
      key?: string; // Optional key to use for storing history, defaults to arg name
    }
  | {
      type: "custom";
      handler: (
        mainHandle: LightrailMainProcessHandle,
        args: ArgsValues
      ) => Promise<TokenArgumentOption[]>;
    }
);

export type ArgsValues = { [key: string]: string };

export type ActionArgument = TokenArgument;

export type PromptContextItem = {
  title: string;
  type: "code" | "text";
  content: string;
  metadata?: any; // Not included in prompt, only for use in actions
};

interface TokenStore {
  getTokenHandle(track: string, name: string): TokenHandle | undefined;
}

export class Prompt {
  _body: string = "";
  _context: PromptContextItem[] = [];
  _json: any;
  _hydrated: boolean = false;
  _tracksManager: TokenStore;

  constructor(json: any, tracksManager: TokenStore) {
    this._json = json;
    this._tracksManager = tracksManager;
  }

  appendContextItem(item: PromptContextItem) {
    this._context.push(item);
  }
  appendText(text: string) {
    this._body += text;
  }
  async hydrate(
    mainHandle: LightrailMainProcessHandle,
    tokenOverrides?: {
      [track: string]: {
        [name: string]: (
          mainHandle: LightrailMainProcessHandle,
          args: ArgsValues,
          prompt: Prompt,
          originalHydrate: (
            mainHandle: LightrailMainProcessHandle,
            args: ArgsValues,
            prompt: Prompt
          ) => Promise<void>
        ) => Promise<void>;
      };
    }
  ): Promise<void> {
    const nodes = this._json["content"];

    for (const node of nodes) {
      if (node.type === "text") {
        this.appendText(node.text);
      } else if (node.type === "token") {
        const token = this._tracksManager.getTokenHandle(
          node.attrs.track,
          node.attrs.name
        );
        if (!token) {
          mainHandle.logger.error("Couldn't find token.", node.attrs);
          throw new Error(`Unknown token ${node.attrs.name}`);
        }

        if (tokenOverrides?.[node.attrs.track]?.[node.attrs.name]) {
          await tokenOverrides[node.attrs.track][node.attrs.name](
            mainHandle,
            node.attrs.args,
            this,
            token.hydrate.bind(token)
          );
        } else {
          await token.hydrate(mainHandle, node.attrs.args, this);
        }
      }
    }

    this._hydrated = true;
  }

  toString(): string {
    if (!this._hydrated) {
      throw new Error(
        "Prompt must be hydrated before converting to string; call `await prompt.hydrate(handle)` first."
      );
    }

    let output =
      this._context.length > 0
        ? "Use the following context to help you respond. Each context item is delimited by the string '======' and starts with the item's title or identifier (i.e a filename, url, etc) as the first line (in backticks):\n\n"
        : "";
    for (const contextItem of this._context) {
      output += "======\n";
      switch (contextItem.type) {
        case "code":
          output += "`" + contextItem.title + "`\n\n";
          output += "```\n" + contextItem.content + "\n```";
          break;
        case "text":
          output += "`" + contextItem.title + "`\n\n";
          output += contextItem.content;
      }
      output += "\n======\n\n";
    }
    if (this._context.length > 0) {
      output += "Use the above context to respond to the following prompt:\n\n";
    }

    output += this._body;

    return output;
  }
}

export type Action = {
  name: string;
  icon: string; // icon name, from fontawesome-regular (eg. "fa-file")
  color: string; // hex color
  description: string; // short description of the action
  args: ActionArgument[]; // a list of AUXILIARY arguments that the action expects (i.e. not including the initial prompt)
  placeholder?: string; // placeholder text for the initial prompt
  handler: (
    mainHandle: LightrailMainProcessHandle,
    promptHandle: Prompt,
    args: ArgsValues
  ) => Promise<void>; // the function that handles the action
  disabled?: boolean;
};

export type Token = {
  name: string;
  color: string;
  description: string;
  args: TokenArgument[]; // Argument values are passed to the token handler/renderer as strings, and the handler is expected to parse them into the appropriate types as needed.
  render: (args: ArgsValues) => string | string[]; // Returns a string to display as the token, or a rendering of args as a string array
  hydrate: (
    mainHandle: LightrailMainProcessHandle,
    args: ArgsValues,
    prompt: Prompt
  ) => Promise<void>; // Modify the prompt object to include the token's content.
  disabled?: boolean;
};

/* Potentially rename this to just a general ArgumentOption type? */
export interface TokenArgumentOption {
  value: any;
  description: string;
  name: string;
}

interface UserChatHistoryItem {
  sender: "user";
  content: object;
}

interface AIChatHistoryItem {
  sender: "ai";
  content: string;
}

export type ChatHistoryItem = UserChatHistoryItem | AIChatHistoryItem;

interface ButtonGroupControl {
  type: "button-group" | "buttons";
  buttons: {
    label: string;
    color?: "primary" | "secondary" | (string & Record<never, never>);
    onClick: () => void;
  }[];
}

interface SliderControl {
  type: "slider";
}

interface CustomControl {
  type: "custom";
}

interface OutputControl {
  type: "output";
  stdout: string;
  stderr: string;
}

interface DataTableControl {
  type: "data-table";
  data: any[];
}

export type LightrailControl =
  | ButtonGroupControl
  | SliderControl
  | CustomControl
  | OutputControl
  | DataTableControl;

export interface LightrailUI {
  reset(): void;
  chat: {
    setHistory: Dispatch<SetStateAction<ChatHistoryItem[]>>;
    setPartialMessage: Dispatch<SetStateAction<string | null>>;
  };
  controls: {
    setControls: Dispatch<SetStateAction<LightrailControl[]>>;
  };
  tasks: {
    startTask: () => TaskHandle;
    getTaskHandle: (id: string) => TaskHandle | undefined;
  };
  notify: (message: string) => void;
}

export type TaskProgress = number | [number, number] | undefined;

export interface TaskHandle {
  id: string;
  setProgress(progress: TaskProgress): void;
  setMessage(message: string): void;
  finishTask(): void;
}

export interface LLMPromptOptions {}

export interface LightrailLLM {
  chat: {
    reset(): void; // Reset the chat model history
    model: BaseChatModel; // Access the current chat model (underlying)
    converse(
      messages: BaseMessage[],
      options?: BaseLanguageModelCallOptions
    ): Promise<BaseMessage>; // Wrapper for model.call that maintains history (new messages are appended to existing history)
  };
}

export interface LightrailFS {
  writeTempFile: (data: string, originalPath?: string) => Promise<string>;
}

export interface ListItemHandle {
  disable(): void;
  enable(): void;
  prioritize(): void; // Move to top of suggestions list
}

export type TokenHandle = Token & ListItemHandle;
export type ActionHandle = Action & ListItemHandle;

export interface LightrailKBItem {
  title: string;
  type: "code" | "text";
  content: string;
  metadata?: any;
  tags: string[];
}

export interface LightrailDataStores {
  kv: {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
  };
  kb: {
    addItems(items: LightrailKBItem[]): Promise<void>;
    query(query: string, tags?: string[]): Promise<LightrailKBItem[]>;
  };
}

export interface TransformSourceOptions {
  path?: string;
}

interface DocumentChunk {
  content: string;
  from: { line: number; char: number | undefined };
  to: { line: number; char: number | undefined };
}

export interface LightrailMainProcessHandle {
  env: "main";
  sendMessageToRenderer(
    messageName: string,
    messageBody?: any,
    broadcast?: any
  ): void;
  sendMessageToExternalClient(
    clientName: string,
    messageName: string,
    messageBody?: any
  ): Promise<any>;
  getTrackTokens(): Token[];
  getTrackActions(): Action[];
  getTokenByName(name: string): Token | undefined;
  getActionByName(name: string): Action | undefined;
  llm: LightrailLLM;
  fs: LightrailFS;
  logger: MainLogger;
  store: LightrailDataStores;
  transform: {
    toChunks(
      text: string,
      sourceOptions: TransformSourceOptions
    ): Promise<DocumentChunk[]>;
    toMarkdown(
      text: string,
      sourceOptions: TransformSourceOptions
    ): Promise<string>;
    tokenizeMarkdown(markdown: string): TokensList;
    // toSummary(text: string, , sourceOptions: TransformSourceOptions): Promise<string>;
  };
}

export interface LightrailRendererProcessHandle {
  env: "renderer";
  sendMessageToMain(
    messageName: string,
    messageBody?: any,
    broadcast?: boolean
  ): Promise<any>;
  getTrackTokens(): TokenHandle[];
  getTrackActions(): ActionHandle[];
  getTokenByName(name: string): TokenHandle | undefined;
  getActionByName(name: string): ActionHandle | undefined;
  ui: LightrailUI | undefined;
  logger: RendererLogger;
}

export type LightrailMainMessageHandler = (
  mainHandle: LightrailMainProcessHandle,
  messageBody?: any
) => Promise<any>;
export type LightrailRendererMessageHandler = (
  rendererHandle: LightrailRendererProcessHandle,
  messageBody?: any
) => Promise<void>;

export interface LightrailTrack {
  name: string;
  tokens?: Token[];
  actions?: Action[];
  handlers?: {
    main?: {
      [messageName: string]: LightrailMainMessageHandler;
    };
    renderer?: {
      [messageName: string]: LightrailRendererMessageHandler;
    };
  };
}
