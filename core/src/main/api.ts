import z from "zod";
import { initTRPC } from "@trpc/server";
import { clipboard } from "electron";
import jsonStorage from "electron-json-storage";
import { promisify } from "util";
import { constructPrompt, stringifyPrompt } from "./prompting";
import { MainLightrail } from "./main-lightrail";
import * as fs from "fs/promises";
import path from "path";
import { TRACKS } from "../tracks";
import { startWSServer } from "./server";
import { LightrailEvent } from "lightrail-sdk";
import log from "./logger";

const t = initTRPC.create({ isServer: true });

const SettingsSchema = z.object({
  openAIApiKey: z.string().optional(),
  model: z.string().optional(),
});

export type SettingsObject = z.infer<typeof SettingsSchema>;
interface HistoryObject {
  prompts: any[];
}

let loadingStatus = {
  tracks: false,
  socketServer: false,
};

export const getRouter = (mainLightrail: MainLightrail) =>
  t.router({
    size: t.procedure
      .input(z.object({ height: z.number(), width: z.number() }))
      .mutation((req) => {
        log.silly("tRPC Call: size: " + JSON.stringify(req.input));
        const { input } = req;
        mainLightrail.window.setSize(input.width, input.height);
        mainLightrail.window.center();
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

    loadTracks: t.procedure.mutation(() => {
      log.silly("tRPC Call: loadTracks");
      if (!loadingStatus.tracks) {
        loadingStatus.tracks = true;
        const trackPromises = TRACKS.map((TrackClass) =>
          new TrackClass(mainLightrail).init()
        );
        log.silly("Tracks loaded");
        return Promise.all(trackPromises);
      }
      log.silly("Tracks already loaded");
      return new Promise((resolve) => resolve(true));
    }),

    startSocketServer: t.procedure.mutation(() => {
      log.silly("tRPC Call: startSocketServer");
      if (!loadingStatus.socketServer) {
        log.silly("Attempting to start socket server");
        loadingStatus.socketServer = true;
        startWSServer(mainLightrail);
      }
      return true;
    }),

    clientEvent: t.procedure
      .input(
        z.object({
          name: z.string(),
          data: z.any(),
        })
      )
      .mutation((req) => {
        log.silly("tRPC Call: clientEvent");
        log.silly("Client Event: " + JSON.stringify(req.input));
        const { input } = req;
        mainLightrail._processEvent(input as LightrailEvent);
      }),

    action: t.procedure
      .input(
        z.object({ name: z.string(), prompt: z.any(), args: z.array(z.any()) })
      )
      .mutation(async (req) => {
        const { input } = req;
        const { name, prompt, args } = input;
        log.silly("tRPC Call: action");
        log.silly("Action Name: " + name);

        if (!mainLightrail.actions.has(name)) {
          throw new Error(`Unknown action: ${name}`);
        }

        const contextualizedPrompt = await constructPrompt(
          prompt,
          mainLightrail
        );

        const stringifiedPrompt = stringifyPrompt(contextualizedPrompt);

        const stringifiedArgs = (
          await Promise.all(args.map((a) => constructPrompt(a, mainLightrail)))
        ).map(stringifyPrompt);

        log.silly("Stringified prompt: " + stringifiedPrompt);

        const action = mainLightrail.actions.get(name)!;

        await action.mainHandler?.(stringifiedPrompt, stringifiedArgs);
      }),
    settings: t.router({
      get: t.procedure.query(() => {
        log.silly("tRPC Call: settings.get");
        const settings = jsonStorage.getSync("settings") as SettingsObject;
        return settings;
      }),
      set: t.procedure.input(SettingsSchema).mutation((req) => {
        log.silly("tRPC Call: settings.set");
        const { input } = req;
        return promisify(jsonStorage.set)("settings", input);
      }),
    }),

    history: t.router({
      get: t.procedure.query(() => {
        log.silly("tRPC Call: history.get");
        const history = jsonStorage.getSync("history") as HistoryObject;
        log.silly("History: " + JSON.stringify(history));
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
