import { Option } from "@renderer/components/OptionsList";
import type {
  Action,
  LightrailEvent,
  LightrailEventName,
  Token,
  Lightrail,
  LightrailUI,
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

  registerAction(action: Action): boolean {
    this.actions.set(action.name, action);
    return true;
  }
  registerToken(token: Token): boolean {
    this.tokens.set(token.name, token);
    return true;
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
    if (listeners) {
      listeners.forEach((listener) => listener(e));
    }
  }

  sendEvent(event: LightrailEvent): Promise<any> {
    return new Promise((resolve) => resolve(true));
  }

  getActionOptions(queryInput?: string): Option[] {
    if (!queryInput) {
      return [...this.actions.values()].map((action) => ({
        ...action,
        kind: "actions",
      }));
    } else {
      const query = queryInput.toLowerCase();
      return [...this.actions.values()]
        .filter(
          (action) =>
            action.name.toLowerCase().includes(query) ||
            action.description.toLowerCase().includes(query)
        )
        .map((action) => ({ ...action, kind: "actions" }));
    }
  }

  getTokenOptions(): Option[] {
    return [...this.tokens.values()].map((token) => ({
      ...token,
      kind: "tokens",
    }));
  }

  getLLMClient() {
    throw new Error("Method not implemented.");
  }
}

export const rendererLightrail = new RendererLightrail();
