import { File } from "@/util/storage";

export type ComponentCreationCallback = (
  name: string,
  props: string[],
  file?: File
) => void;

export interface Table {
  table_name: string;
}
