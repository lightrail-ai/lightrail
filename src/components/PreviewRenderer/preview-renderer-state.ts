import { atom } from "recoil";

export const hoveringComponent = atom<null | {
  name: string;
  rects: DOMRect[];
}>({
  key: "hoveringComponent",
  default: null,
});

export const editingComponent = atom<null | {
  name: string;
}>({
  key: "editingComponent",
  default: null,
});

export const namePopoverTarget = atom<null | HTMLElement>({
  key: "namePopoverTarget",
  default: null,
});

export const editingPopoverTarget = atom<null | HTMLElement>({
  key: "editingPopoverTarget",
  default: null,
});

export const errorsQueue = atom<
  {
    component: string;
    error: string;
  }[]
>({
  key: "errorsQueue",
  default: [],
});
