import z from "zod";
import { initTRPC } from "@trpc/server";
import { BrowserWindow, clipboard } from "electron";
import jsonStorage from "electron-json-storage";
import { promisify } from "util";
import { stringifyPrompt } from "./prompting";
import { MainLightrail } from "./main-lightrail";
import * as fs from "fs/promises";
import path from "path";

const t = initTRPC.create({ isServer: true });

const SettingsSchema = z.object({
  openAIApiKey: z.string(),
});

export type SettingsObject = z.infer<typeof SettingsSchema>;

export const getRouter = (mainLightrail: MainLightrail) =>
  t.router({
    size: t.procedure
      .input(z.object({ height: z.number(), width: z.number() }))
      .mutation((req) => {
        const { input } = req;
        mainLightrail.window.setSize(input.width, input.height);
        mainLightrail.window.center();
      }),
    clipboard: t.procedure.input(z.string()).mutation((req) => {
      const { input } = req;
      clipboard.writeText(input);
    }),

    action: t.procedure
      .input(
        z.object({ name: z.string(), prompt: z.any(), args: z.array(z.any()) })
      )
      .mutation(async (req) => {
        const { input } = req;
        const { name, prompt, args } = input;

        console.log(name);
        if (!mainLightrail.actions.has(name)) {
          throw new Error(`Unknown action: ${name}`);
        }

        const stringifiedMainPrompt = await stringifyPrompt(
          prompt,
          mainLightrail
        );
        const stringifiedArgs = await Promise.all(
          args.map((a) => stringifyPrompt(a, mainLightrail))
        );

        console.log(stringifiedMainPrompt);

        const action = mainLightrail.actions.get(name)!;

        console.log(action);
        await action.mainHandler?.(stringifiedMainPrompt, stringifiedArgs);
      }),
    settings: t.router({
      get: t.procedure.query(() => {
        const settings = jsonStorage.getSync("settings") as SettingsObject;
        return settings;
      }),
      set: t.procedure.input(SettingsSchema).mutation((req) => {
        const { input } = req;
        return promisify(jsonStorage.set)("settings", input);
      }),
    }),

    files: t.router({
      list: t.procedure.input(z.string()).query(async (req) => {
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
