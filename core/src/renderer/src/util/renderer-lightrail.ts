import { Option } from "@renderer/components/OptionsList";
import type {
  Action,
  LightrailEvent,
  LightrailEventName,
  Token,
  Lightrail,
  LightrailUI,
  ActionHandle,
  TokenHandle,
} from "lightrail-sdk";

class RendererLightrail implements Lightrail {
  actions: Map<string, Action> = new Map();
  tokens: Map<string, Token> = new Map();
  eventListeners: {
    [eventName: string]: ((event: LightrailEvent) => Promise<void>)[];
  } = {};
  isRenderer = true;
  isMain = false;
  ui: LightrailUI | undefined = undefined;

  registerAction(action: Action): ActionHandle {
    this.actions.set(action.name, action);
    const ctx = this;
    return {
      disable() {
        ctx.actions.get(action.name)!.disabled = true;
      },
      enable() {
        ctx.actions.get(action.name)!.disabled = false;
      },
      prioritize() {
        const temp = ctx.actions.get(action.name)!;
        ctx.actions.delete(action.name);
        ctx.actions.set(action.name, temp);
      },
    };
  }
  registerToken(token: Token): TokenHandle {
    this.tokens.set(token.name, token);
    const ctx = this;
    return {
      disable() {
        ctx.tokens.get(token.name)!.disabled = true;
      },
      enable() {
        ctx.tokens.get(token.name)!.disabled = false;
      },
      prioritize() {
        const temp = ctx.tokens.get(token.name)!;
        ctx.tokens.delete(token.name);
        ctx.tokens.set(token.name, temp);
      },
    };
  }
  registerEventListener(
    eventName: LightrailEventName,
    handler: (event: LightrailEvent) => Promise<void>
  ): boolean {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }
    this.eventListeners[eventName].push(handler);
    return true;
  }

  _processEvent(e: LightrailEvent) {
    const listeners = this.eventListeners[e.name];
    console.log("PROCESSING EVENT", e);
    console.log("LISTENERS", listeners);
    if (listeners) {
      listeners.forEach((listener) => listener(e));
    }
  }

  sendEvent(event: LightrailEvent): Promise<any> {
    return new Promise((resolve) => resolve(true));
  }

  getActionOptions(queryInput?: string): Option[] {
    const actionList = [...this.actions.values()]
      .filter((a) => !a.disabled)
      .reverse();
    if (!queryInput) {
      return actionList.map((action) => ({
        ...action,
        kind: "actions",
      }));
    } else {
      const query = queryInput.toLowerCase();
      return actionList
        .filter(
          (action) =>
            action.name.toLowerCase().includes(query) ||
            action.description.toLowerCase().includes(query)
        )
        .map((action) => ({ ...action, kind: "actions" }));
    }
  }

  getTokenOptions(queryInput?: string): Option[] {
    const tokenList = [...this.tokens.values()]
      .filter((t) => !t.disabled)
      .reverse();
    if (!queryInput) {
      return tokenList.map((token) => ({
        ...token,
        kind: "tokens",
      }));
    } else {
      const query = queryInput.toLowerCase();
      return tokenList
        .filter(
          (token) =>
            token.name.toLowerCase().includes(query) ||
            token.description.toLowerCase().includes(query)
        )
        .map((token) => ({ ...token, kind: "tokens" }));
    }
  }

  getLLMClient() {
    throw new Error("Method not implemented.");
  }

  async writeTempFile(): Promise<string> {
    throw new Error("Method not implemented.");
  }
}

export const rendererLightrail = new RendererLightrail();
