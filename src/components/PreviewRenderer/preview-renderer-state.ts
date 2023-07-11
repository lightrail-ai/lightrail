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

export const previewIframeRef = atom<null | HTMLIFrameElement>({
  key: "previewIframeRef",
  default: null,
});
