import { createTRPCProxyClient } from "@trpc/client";
import { ipcLink } from "electron-trpc/renderer";
import type { AppRouter } from "../../../main/api";

export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [ipcLink()],
});
