import { LogFunctions } from "electron-log";
import type {
  Action,
  ActionHandle,
  LightrailMainProcessHandle,
  LightrailRendererProcessHandle,
  LightrailTrack,
  Token,
  TokenArgumentOption,
  TokenHandle,
} from "lightrail-sdk";

export type ActionOption = Action & { kind: "actions"; track: string };
export type TokenOption = Token & { kind: "tokens"; track: string };

export type Option =
  | ActionOption
  | TokenOption
  | (TokenArgumentOption & { kind: "token-args" | "action-args" });

export class TracksManager {
  _tracks: {
    [name: string]: LightrailTrack;
  } = {};
  _actions: Map<string, ActionOption> = new Map();
  _tokens: Map<string, TokenOption> = new Map();
  _logger: LogFunctions;
  _env: "main" | "renderer";
  processHandleFactory:
    | undefined
    | ((
        track: LightrailTrack
      ) => LightrailMainProcessHandle | LightrailRendererProcessHandle) =
    undefined;

  constructor(env: "main" | "renderer", logger: LogFunctions) {
    this._env = env;
    this._logger = logger;
  }

  registerTrack(track: LightrailTrack) {
    if (this._tracks[track.name]) {
      this._logger.warn(
        "Tracks manager attempted to register track " +
          track.name +
          " but it was already registered!"
      );
      return;
    }
    this._logger.silly(
      `Registering track with tracks manager (${this._env}): ` + track.name
    );
    this._tracks[track.name] = track;
    if (track.tokens) {
      track.tokens.forEach((token) => {
        this._tokens.set(track.name + ":" + token.name, {
          ...token,
          track: track.name,
          kind: "tokens",
        });
      });
    }
    if (track.actions) {
      track.actions.forEach((action) => {
        this._actions.set(track.name + ":" + action.name, {
          ...action,
          track: track.name,
          kind: "actions",
        });
      });
    }
  }

  getTrack(trackName: string): LightrailTrack | undefined {
    return this._tracks[trackName];
  }

  getProcessHandle(
    trackName: string
  ): LightrailMainProcessHandle | LightrailRendererProcessHandle | undefined {
    const track = this._tracks[trackName];
    if (!track || !this.processHandleFactory) {
      return undefined;
    }
    return this.processHandleFactory(track);
  }

  getActionHandle(trackName: string, name: string): ActionHandle | undefined {
    const qualifiedName = trackName + ":" + name;
    const action = this._actions.get(qualifiedName);
    const ctx = this;
    if (!action) {
      return undefined;
    }
    return {
      ...action,
      disable() {
        ctx._actions.get(qualifiedName)!.disabled = true;
      },
      enable() {
        ctx._actions.get(qualifiedName)!.disabled = false;
      },
      prioritize() {
        const temp = ctx._actions.get(qualifiedName)!;
        ctx._actions.delete(qualifiedName);
        temp.disabled = false;
        ctx._actions.set(qualifiedName, temp);
      },
    };
  }

  getTokenHandle(trackName: string, name: string): TokenHandle | undefined {
    const qualifiedName = trackName + ":" + name;
    const token = this._tokens.get(qualifiedName);
    const ctx = this;
    if (!token) {
      return undefined;
    }
    return {
      ...token,
      disable() {
        ctx._tokens.get(qualifiedName)!.disabled = true;
      },
      enable() {
        ctx._tokens.get(qualifiedName)!.disabled = false;
      },
      prioritize() {
        const temp = ctx._tokens.get(qualifiedName)!;
        ctx._tokens.delete(qualifiedName);
        temp.disabled = false;
        ctx._tokens.set(qualifiedName, temp);
      },
    };
  }

  getTrackActionHandles(trackName: string): ActionHandle[] {
    return (
      this._tracks[trackName].actions?.map(
        (action) => this.getActionHandle(trackName, action.name)!
      ) ?? []
    );
  }

  getTrackTokenHandles(trackName: string): TokenHandle[] {
    return (
      this._tracks[trackName].tokens?.map(
        (token) => this.getTokenHandle(trackName, token.name)!
      ) ?? []
    );
  }

  getTokenList(queryInput?: string): TokenOption[] {
    const tokenList = [...this._tokens.values()]
      .filter((t) => !t.disabled)
      .reverse();
    if (!queryInput) {
      return tokenList;
    } else {
      const query = queryInput.toLowerCase();
      return tokenList.filter(
        (token) =>
          token.name.toLowerCase().includes(query) ||
          token.description.toLowerCase().includes(query)
      );
    }
  }

  getActionList(queryInput?: string): ActionOption[] {
    const actionList = [...this._actions.values()]
      .filter((a) => !a.disabled)
      .reverse();
    if (!queryInput) {
      return actionList;
    } else {
      const query = queryInput.toLowerCase();
      return actionList.filter(
        (action) =>
          action.name.toLowerCase().includes(query) ||
          action.description.toLowerCase().includes(query)
      );
    }
  }
}
