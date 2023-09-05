import { atom } from "recoil";

export const viewAtom = atom<"prompt" | "settings">({
  key: "viewState",
  default: "prompt",
});

export const promptHistoryAtom = atom<any[]>({
  key: "promptHistoryState",
  default: [],
});
