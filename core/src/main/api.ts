import z from "zod";
import { initTRPC } from "@trpc/server";
import { clipboard } from "electron";
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
import { LightrailTrack, Prompt } from "lightrail-sdk";
import ChatTrack from "../basic-tracks/chat";
import SystemTrack from "../basic-tracks/system";

const t = initTRPC.create({
  isServer: true,
});

const providersZodType = z.enum(["lightrail", "openai"]);
const SettingsSchema = z.object({
  provider: providersZodType,
  model: z.enum(["gpt-3.5-turbo-16k", "gpt-4", "gpt-3.5-turbo"]),
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
    size: t.procedure
      .input(z.object({ height: z.number(), width: z.number() }))
      .mutation((req) => {
        log.silly("tRPC Call: size: " + JSON.stringify(req.input));
        const { input } = req;
        window.setSize(input.width, input.height);
        window.center();
      }),
    clipboard: t.procedure.input(z.string()).mutation((req) => {
      log.silly("tRPC Call: clipboard");
      const { input } = req;
      clipboard.writeText(input);
    }),

    screenSize: t.procedure.query(() => {
      log.silly("tRPC Call: screenSize");
      const { screen } = require("electron");
      const screenSize = screen.getPrimaryDisplay().workAreaSize;
      log.silly("Screen size: " + JSON.stringify(screenSize));
      return screenSize;
    }),

    setup: t.procedure.mutation(async () => {
      log.silly("tRPC Call: setup");
      // Initialize settings
      const settings = jsonStorage.getSync("settings") as SettingsObject;
      if (!settings || !settings.provider || !settings.model) {
        await promisify(jsonStorage.set)("settings", {
          provider: "lightrail",
          model: "gpt-3.5-turbo-16k",
          apiKeys: {},
        } as SettingsObject);
        chatManager.model = LightrailChatLLMInterface.initializeModel();
      }
    }),

    loadTracks: t.procedure.mutation(async () => {
      log.silly("tRPC Call: loadTracks");
      // Load tracks from disk
      const tracksRoot = "/home/vishnumenon/Documents/lightrail/tracks";
      // List tracks from tracks folder
      const trackDirs = await fs.readdir(tracksRoot);
      log.silly("Found Tracks: " + JSON.stringify(trackDirs));
      let pathsForRenderer: string[] = [];
      for (const trackDir of trackDirs) {
        log.silly("Loading track from dir: " + trackDir);
        const trackDirPath = path.join(tracksRoot, trackDir);
        const packageJson = JSON.parse(
          await fs.readFile(path.join(trackDirPath, "package.json"), "utf-8")
        );
        const mainPath = path.resolve(trackDirPath, packageJson.main);
        const browserPath = path.resolve(trackDirPath, packageJson.browser);
        log.silly("Loading track from path: " + mainPath);
        pathsForRenderer.push(
          "lightrailtrack://" + path.relative(tracksRoot, browserPath)
        );
        const imp = (await import(mainPath)).default;
        // NB: This is a hack to deal w/ some weirdness in the way bundling works currently for tracks
        const track: LightrailTrack = imp.default ? imp.default : imp;
        if (!track.name) {
          log.error("Track import failed from path: " + mainPath);
        } else {
          mainMessagingHub.registerTrack(track);
          mainTracksManager.registerTrack(track);
        }
      }
      // Load built-in tracks
      for (const track of [SystemTrack, ChatTrack]) {
        mainMessagingHub.registerTrack(track);
        mainTracksManager.registerTrack(track);
      }
      log.silly("Tracks loaded");
      return pathsForRenderer;
    }),

    startSocketServer: t.procedure.mutation(() => {
      log.silly("tRPC Call: startSocketServer");
      if (!loadingStatus.socketServer) {
        log.silly("Attempting to start socket server");
        loadingStatus.socketServer = true;
        startWSServer();
      }
      return true;
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
        log.silly("tRPC Call: clientEvent");
        const { input } = req;
        log.silly(
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
        log.silly("tRPC Call: action");
        log.silly("Action Name: " + name);

        const processHandle = mainTracksManager.getProcessHandle(track);
        const handler = mainTracksManager.getActionHandle(track, name)?.handler;

        if (handler && processHandle?.env === "main") {
          return await handler(
            processHandle,
            new Prompt(prompt, mainTracksManager),
            args
          );
        } else {
          throw new Error(`Unknown/un-handled action: ${track} ${name}`);
        }
      }),
    settings: t.router({
      get: t.procedure.query(() => {
        log.silly("tRPC Call: settings.get");
        const settings = jsonStorage.getSync("settings") as SettingsObject;
        return settings;
      }),
      set: t.procedure.input(SettingsSchema).mutation(async (req) => {
        log.silly("tRPC Call: settings.set");
        const { input } = req;
        await promisify(jsonStorage.set)("settings", input);
        chatManager.model = LightrailChatLLMInterface.initializeModel();
      }),
    }),

    history: t.router({
      get: t.procedure.query(() => {
        log.silly("tRPC Call: history.get");
        const history = jsonStorage.getSync("history") as HistoryObject;
        log.silly("History length: " + history.prompts?.length);
        return history.prompts ?? [];
      }),
      set: t.procedure.input(z.array(z.any())).mutation((req) => {
        log.silly("tRPC Call: history.set");
        const { input } = req;
        return promisify(jsonStorage.set)("history", {
          prompts: input,
        });
      }),
      append: t.procedure.input(z.any()).mutation((req) => {
        log.silly("tRPC Call: history.append");
        const { input } = req;
        const history = jsonStorage.getSync("history") as HistoryObject;

        return promisify(jsonStorage.set)("history", {
          prompts: [input, ...(history.prompts ?? [])],
        });
      }),
    }),

    files: t.router({
      list: t.procedure.input(z.string()).query(async (req) => {
        log.silly("tRPC Call: files.list");
        const { input } = req;
        const contents = await fs.readdir(input, {
          withFileTypes: true,
        });
        return contents.map((f) => ({
          name: f.name,
          isDirectory: f.isDirectory(),
          path: path.join(input, f.name),
        }));
      }),
    }),
  });

export type AppRouter = ReturnType<typeof getRouter>;
