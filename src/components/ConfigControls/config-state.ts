import { atom } from "recoil";

export const configState = atom<{
  theme: "light" | "dark";
}>({
  key: "configState",
  default: {
    theme: "light",
  },
});
