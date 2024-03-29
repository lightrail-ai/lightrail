import z from "zod";
import { initTRPC } from "@trpc/server";
import { app, clipboard } from "electron";
import jsonStorage from "electron-json-storage";
import { promisify } from "util";
import * as fs from "fs/promises";
import path from "path";
import { startWSServer } from "./server";
import log from "./logger";
import { BrowserWindow } from "electron/main";
import {
  LightrailChatLLMInterface,
  chatManager,
  mainMessagingHub,
  mainTracksManager,
} from "./lightrail-main";
import {
  ActionHandle,
  LightrailMainProcessHandle,
  Prompt,
  TokenArgumentOption,
  TokenHandle,
} from "lightrail-sdk";
import { TRACKS_DIR, installTrack, loadTracks } from "./track-admin";
import { LightrailKVStore } from "./storage/kv";
import os from "os";
import { noticeQueue } from "./updates";
import { isComplete, markComplete } from "./checklist";
import { openDb } from "./storage/sqlite";
import { lightrailKBInstance } from "./storage/interface";

const t = initTRPC.create({
  isServer: true,
});

const providersZodType = z.enum(["lightrail", "openai"]);
const SettingsSchema = z.object({
  provider: providersZodType,
  model: z.enum([
    "gpt-3.5-turbo-16k",
    "gpt-4",
    "gpt-3.5-turbo",
    "gpt-4-vision-preview",
  ]),
  apiKeys: z.record(providersZodType, z.string()),
});

export type SettingsObject = z.infer<typeof SettingsSchema>;
interface HistoryObject {
  prompts: any[];
}

let loadingStatus = {
  tracks: false,
  socketServer: false,
};

export const getRouter = (window: BrowserWindow) =>
  t.router({
    version: t.procedure.query(() => {
      log.info("tRPC Call: version");
      return app.getVersion();
    }),
    size: t.router({
      set: t.procedure
        .input(z.object({ height: z.number(), width: z.number() }))
        .mutation((req) => {
          log.debug("tRPC Call: size: " + JSON.stringify(req.input));
          const { input } = req;
          window.setSize(input.width, input.height);
          window.center();
        }),
      get: t.procedure.query(() => {
        log.info("tRPC Call: size");
        const { width, height } = window.getBounds();
        return { width, height };
      }),
    }),
    clipboard: t.procedure.input(z.string()).mutation((req) => {
      log.info("tRPC Call: clipboard");
      const { input } = req;
      clipboard.writeText(input);
    }),

    screenSize: t.procedure.query(() => {
      log.debug("tRPC Call: screenSize");
      const { screen } = require("electron");
      const screenSize = screen.getPrimaryDisplay().workAreaSize;
      log.debug("Screen size: " + JSON.stringify(screenSize));
      return screenSize;
    }),

    setup: t.procedure.mutation(async () => {
      log.info("tRPC Call: setup");
      // Initialize settings
      const settings = jsonStorage.getSync("settings") as SettingsObject;
      if (!settings || !settings.provider || !settings.model) {
        log.info("No valid settings found, (re)initializing settings");
        await promisify(jsonStorage.set)("settings", {
          provider: "lightrail",
          model: "gpt-4",
          apiKeys: {},
        } as SettingsObject);
        chatManager.model = LightrailChatLLMInterface.initializeModel();
      }
      // Make sure track directory exists
      await fs.mkdir(TRACKS_DIR, { recursive: true });
      // If track directory is empty, we want to run the onboarding flow
      const trackDirs = await fs.readdir(TRACKS_DIR);
      const hasOnboarded = await isComplete("onboarding");
      if (trackDirs.length === 0 && !hasOnboarded) {
        log.info("No tracks found, running onboarding flow");
        return {
          onboard: true,
        };
      } else {
        log.info("Tracks found, not running onboarding flow");
        return {
          onboard: false,
        };
      }
    }),

    onboarding: t.router({
      complete: t.procedure.mutation(() => {
        log.info("tRPC Call: onboarding.complete");
        return markComplete("onboarding");
      }),
    }),

    tracks: t.router({
      location: t.procedure.query(() => {
        log.info("tRPC Call: tracks.location");
        return TRACKS_DIR;
      }),
      load: t.procedure.mutation(async () => {
        log.info("tRPC Call: tracks.load");
        const paths = await loadTracks();
        return paths;
      }),
      install: t.procedure.input(z.string()).mutation(async (req) => {
        log.info("tRPC Call: tracks.install");
        await installTrack(req.input);
        const paths = await loadTracks();
        return paths;
      }),
      repository: t.procedure.query(async (req) => {
        const r = await fetch(
          "https://tracks.lightrail.ai/track-repository.json"
        );
        const json = await r.json();
        return json;
      }),
    }),

    clients: t.procedure.query(() => {
      log.info("tRPC Call: clients");
      const clients = {};
      for (const [name, socket] of Object.entries(mainMessagingHub._clients)) {
        clients[name] = socket.connected;
      }
      return clients;
    }),

    startSocketServer: t.procedure.mutation(() => {
      log.info("tRPC Call: startSocketServer");
      if (!loadingStatus.socketServer) {
        log.info("Attempting to start socket server");
        loadingStatus.socketServer = true;
        startWSServer();
      }
      return true;
    }),

    notices: t.router({
      pop: t.procedure.mutation(async () => {
        log.info("tRPC Call: notices.pop");
        const notice = noticeQueue.shift();
        if (notice) {
          await markComplete(notice.id);
        }
        return notice?.content;
      }),
    }),

    kb: t.router({
      reset: t.procedure.mutation(async () => {
        log.info("tRPC Call: kb.reset");

        const sqliteDb = await openDb();
        await sqliteDb.exec("DELETE FROM KBSource");
        await sqliteDb.exec("DELETE FROM KBDocument");
        await sqliteDb.exec("DELETE FROM KBItem");
        await sqliteDb.exec("DELETE FROM KBTags");
        await sqliteDb.exec("DELETE FROM KBSource_KBTags");
        await sqliteDb.exec("DELETE FROM KBDocument_KBTags");
        await sqliteDb.exec("DELETE FROM KBItem_KBTags");

        await lightrailKBInstance._vectorStore.reset(
          lightrailKBInstance._className
        );

        const trackKVStore = new LightrailKVStore(
          mainTracksManager.getTrack("kb")!
        );
        await trackKVStore.set(`argHistory-#key-kb-tag`, []);
      }),
    }),

    clientEvent: t.procedure
      .input(
        z.object({
          track: z.string(),
          name: z.string(),
          body: z.any(),
          broadcast: z.boolean().optional(),
        })
      )
      .mutation((req) => {
        log.info("tRPC Call: clientEvent");
        const { input } = req;
        log.info(
          "Client Event: ",
          input.track,
          input.name,
          input.body,
          input.broadcast ? "(broadcast)" : ""
        );
        return mainMessagingHub.routeMessage(
          input.track,
          mainTracksManager,
          input.name,
          input.body,
          input.broadcast
        );
      }),

    action: t.procedure
      .input(
        z.object({
          track: z.string(),
          name: z.string(),
          prompt: z.any(),
          args: z.record(z.string(), z.any()),
        })
      )
      .mutation(async (req) => {
        const { input } = req;
        const { track, name, prompt, args } = input;
        log.info("tRPC Call: action");
        log.info("Action Name: " + name);

        const processHandle = mainTracksManager.getProcessHandle(track);
        const handler = mainTracksManager.getActionHandle(track, name)?.handler;

        if (handler && processHandle?.env === "main") {
          try {
            return await handler(
              processHandle,
              new Prompt(prompt, mainTracksManager),
              args
            );
          } catch (e) {
            log.error(e);
            throw e;
          }
        } else {
          throw new Error(`Unknown/un-handled action: ${track} ${name}`);
        }
      }),
    settings: t.router({
      get: t.procedure.query(() => {
        log.info("tRPC Call: settings.get");
        const settings = jsonStorage.getSync("settings") as SettingsObject;
        return settings;
      }),
      set: t.procedure.input(SettingsSchema).mutation(async (req) => {
        log.info("tRPC Call: settings.set");
        const { input } = req;
        await promisify(jsonStorage.set)("settings", input);
        chatManager.model = LightrailChatLLMInterface.initializeModel();
      }),
    }),

    history: t.router({
      get: t.procedure.query(() => {
        log.info("tRPC Call: history.get");
        const history = jsonStorage.getSync("history") as HistoryObject;
        log.info("History length: " + history.prompts?.length);
        return history.prompts ?? [];
      }),
      set: t.procedure.input(z.array(z.any())).mutation((req) => {
        log.info("tRPC Call: history.set");
        const { input } = req;
        return promisify(jsonStorage.set)("history", {
          prompts: input,
        });
      }),
      append: t.procedure.input(z.any()).mutation((req) => {
        log.info("tRPC Call: history.append");
        const { input } = req;
        const history = jsonStorage.getSync("history") as HistoryObject;

        return promisify(jsonStorage.set)("history", {
          prompts: [input, ...(history.prompts ?? [])],
        });
      }),
    }),

    argHistory: t.router({
      get: t.procedure
        .input(
          z.object({
            track: z.string(),
            path: z.string(),
            arg: z.string(),
          })
        )
        .query(async (req) => {
          log.info("tRPC Call: argHistory.get");
          const { track, path, arg } = req.input;
          const trackKVStore = new LightrailKVStore(
            mainTracksManager.getTrack(track)!
          );
          const res = await trackKVStore.get<TokenArgumentOption[]>(
            `argHistory-${path}-${arg}`
          );
          return res?.map((o) => ({ ...o, value: o.value as object })) ?? [];
        }),
      append: t.procedure
        .input(
          z.object({
            track: z.string(),
            path: z.string(),
            arg: z.string(),
            option: z.object({
              value: z.any(),
              description: z.string().optional(),
              name: z.string(),
            }),
          })
        )
        .mutation(async (req) => {
          log.info("tRPC Call: argHistory.append", req.input);
          const { track, path, arg, option } = req.input;

          const trackKVStore = new LightrailKVStore(
            mainTracksManager.getTrack(track)!
          );
          const history =
            (await trackKVStore.get<TokenArgumentOption[]>(
              `argHistory-${path}-${arg}`
            )) ?? [];

          option.description =
            option.description ??
            history.find((o) => o.value === option.value)?.description ??
            "";

          return trackKVStore.set(`argHistory-${path}-${arg}`, [
            option,
            ...history.filter((o) => o.value !== option.value),
          ]);
        }),
    }),

    handlers: t.procedure
      .input(
        z.object({
          track: z.string(),
          token: z.string().optional(),
          action: z.string().optional(),
          arg: z.string(),
          input: z.any(),
        })
      )
      .query(async (req) => {
        log.info("tRPC Call: handlers");
        const { track, token, action, arg: argName, input } = req.input;
        let handle: TokenHandle | ActionHandle | undefined;
        if (token) {
          handle = mainTracksManager.getTokenHandle(track, token);
        } else if (action) {
          handle = mainTracksManager.getActionHandle(track, action);
        }
        const arg = handle?.args.find((a) => a.name === argName);
        if (!arg || arg.type !== "custom") {
          throw new Error("Handler not found");
        }
        const processHandle = mainTracksManager.getProcessHandle(
          track
        ) as LightrailMainProcessHandle;

        const result = await arg.handler(processHandle, input);
        return result.map((r) => ({ ...r, value: r.value as object }));
      }),

    files: t.router({
      list: t.procedure.input(z.string()).query(async (req) => {
        log.info("tRPC Call: files.list");
        const { input } = req;
        const canonicalPath = input.replace(/^~/, os.homedir());

        const contents = await fs.readdir(canonicalPath, {
          withFileTypes: true,
        });
        return contents.map((f) => ({
          name: f.name,
          isDirectory: f.isDirectory(),
          path: path.join(canonicalPath, f.name),
        }));
      }),
    }),
  });

export type AppRouter = ReturnType<typeof getRouter>;
