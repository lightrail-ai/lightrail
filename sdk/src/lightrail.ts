/* The Lightrail Track Paradigm
 * ============================
 * A Track is an extension of Lightrail's functionality.
 *
 * The user-facing aspect of a Track is a set of Tokens and Actions.
 * Tokens are used to augment prompts with additional information / context
 * Actions define how a prompt is used and/or how the response is handled
 * Tokens and Actions are registered with the Lightrail instance to make them available to the user
 * Actions can define their arguments, but their first argument will always be a free-form prompt of some kind.
 * Tokens can also define arguments as well as a function to transform the prompt using provided helpers.
 *
 * Tracks can also define event listeners, which are similarly registered with the Lightrail instance.
 * Event listeners are called when a certain event occurs, and are passed the event object as an argument.
 * Event names can be predefined Lightrail events, or custom events. Custom events are strings, but should be namespaced to avoid collisions (i.e. extension-name:event-name-kabob).
 * Events can also be sent by third-party code / extensions to trigger actions or other functionality.
 *
 *
 * A Track is initialized by calling its init() method, which registers its Tokens and Actions with the Lightrail instance
 * The Lightrail instance is passed to the Track constructor, and is defined by the interface below.
 *
 * Tracks should be designed with the Unix Philosphy in mind, i.e. composability, modularity, and reusability, with a focus on doing one thing well and using text as the universal interface.
 */

// import type { OpenAIChatApi } from "llm-api";
import type { Dispatch, SetStateAction } from "react";

type OpenAIChatApi = any;

export type ColorPair = [background: string, foreground: string];

export type ActionArgument = {
  name: string;
  description: string;
} & (
  | { type: "string" }
  | { type: "number" }
  | { type: "boolean" }
  | { type: "choice"; choices: string[] }
  | { type: "path" }
);

export interface TrackEventChannel {
  send(eventName: string, eventData: any): void;
}

export type Action = {
  name: string;
  icon: string; // icon name, from fontawesome-regular (eg. "fa-file")
  colors: ColorPair; // hex color
  description: string; // short description of the action
  args: ActionArgument[]; // a list of AUXILIARY arguments that the action expects (i.e. not including the initial prompt)
  rendererHandler?: (prompt: object, args: object[]) => Promise<void> | void; // Arguments are passed to the action handler as objects, and the handler is expected to parse them into the appropriate types.
  mainHandler?: (prompt: string, args: string[]) => Promise<void>; // Arguments are passed to the action handler as strings, and the handler is expected to parse them into the appropriate types.
};

export type TokenArgument = ActionArgument;

export type Prompt = string;

export type Token = {
  name: string;
  colors: ColorPair;
  description: string;
  args: TokenArgument[]; // Argument values are passed to the token handler/renderer as strings, and the handler is expected to parse them into the appropriate types as needed.
  renderer: (args: string[]) => string; // Returns a string for displaying the token in the prompt field.
  handler: (args: string[], prompt: Prompt) => Promise<Prompt>;
};

export interface TokenArgumentOption {
  value: any;
  description: string;
  name: string;
}

export type LightrailEventName =
  | "prompt"
  | "response"
  | "action"
  | "token"
  | (string & Record<never, never>);

export type LightrailView = "prompt" | "settings" | "chat";

export type LightrailEvent = {
  name: LightrailEventName;
  data: any;
};

interface UserChatHistoryItem {
  sender: "user";
  content: object;
}

interface AIChatHistoryItem {
  sender: "ai";
  content: string;
}

export type ChatHistoryItem = UserChatHistoryItem | AIChatHistoryItem;

export interface LightrailUI {
  setView(view: LightrailView): void;
  chat: {
    setHistory: Dispatch<SetStateAction<ChatHistoryItem[]>>;
    setPartialMessage: Dispatch<SetStateAction<string | null>>;
  };
}

export interface Lightrail {
  registerAction(action: Action): boolean;
  registerToken(token: Token): boolean;
  registerEventListener(
    eventName: LightrailEventName,
    handler: (event: LightrailEvent) => Promise<any>
  ): boolean;
  sendEvent(event: LightrailEvent, destinationClient?: string): Promise<any>;
  getLLMClient(): OpenAIChatApi | void;
  isRenderer: boolean;
  isMain: boolean;
  ui: LightrailUI | undefined;
}

export interface LightrailTrack {
  lightrail: Lightrail;
  setup?(): Promise<void>; // Run once, on install, if present
  init(): Promise<void>; // Run on load to register actions and tokens
}
