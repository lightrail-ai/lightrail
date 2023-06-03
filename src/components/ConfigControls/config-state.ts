import { atom } from "recoil";

export const configState = atom<{
  editUX: "popover" | "panel";
}>({
  key: "configState",
  default: {
    editUX: "panel",
  },
});
