import { File } from "@/util/storage";

export type ComponentCreationCallback = (
  name: string,
  props: string[],
  file?: File
) => void;
