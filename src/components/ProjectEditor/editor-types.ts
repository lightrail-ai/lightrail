import { File } from "@/util/storage";

export type ComponentCreationCallback = (
  name: string,
  props: string[],
  file?: File
) => void;

export interface Column {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

export interface Table {
  table_name: string;
  columns: Column[];
}
