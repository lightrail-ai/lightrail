import {
  SupabaseClient,
  createRouteHandlerClient,
} from "@supabase/auth-helpers-nextjs";
import { Database } from "../supabase";

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export interface FileDescription {
  path: string;
  contents: string;
  externals?: FileExternalItem[] | null;
  state?: FileStateItem[] | null;
}
export type File = Database["public"]["Tables"]["files"]["Row"];
export type NewFile = Database["public"]["Tables"]["files"]["Insert"];
export type FileRevision =
  Database["public"]["Tables"]["file_revisions"]["Row"];
export type FileUpdate = Database["public"]["Tables"]["files"]["Update"];
export type NewFileRevision =
  Database["public"]["Tables"]["file_revisions"]["Insert"];
export type Db = Database["public"]["Tables"]["databases"]["Row"];
export type NewDb = Database["public"]["Tables"]["databases"]["Insert"];
export type ProjectWithFiles = Project & { files: File[] };
export interface FileStateItem {
  name: string;
  initial: any;
}
export interface FileQueryItem {
  name: string;
  query: string;
}

export interface FileExternalItem {
  default?: string;
  names?: string[];
  from: string;
}

// export async function setProject(project: Project) {
//   await supabase.from("projects").upsert(project);
// }

export class Client {
  supabase: SupabaseClient<Database>;

  constructor(options: any, supabase?: SupabaseClient<Database>) {
    this.supabase = supabase ?? createRouteHandlerClient<Database>(options);
  }

  async getProject(projectId: number): Promise<ProjectWithFiles> {
    let project = await this.supabase
      .from("projects")
      .select()
      .eq("id", projectId)
      .single();
    let files = await this.supabase
      .from("files")
      .select()
      .eq("project_id", projectId);

    return { ...project.data!, files: files.data! };
  }

  async getProjectFileNames(projectId: number): Promise<string[]> {
    const { data } = await this.supabase
      .from("files")
      .select("path")
      .eq("project_id", projectId);

    return data ? data.map((file) => file.path) : [];
  }

  async getUserProjects() {
    const resp = await this.supabase.auth.getUser();
    if (!resp.data.user?.id) return [];

    const { data } = await this.supabase
      .from("projects")
      .select()
      .eq("owner", resp.data.user.id);
    return data;
  }

  async createProject(
    name: string,
    description?: string,
    type?: string,
    libraries?: string[]
  ) {
    const res = await this.supabase
      .from("projects")
      .insert({ name, description, type, libraries })
      .select("id")
      .single();
    return res.data!.id;
  }

  async getFile(projectId: number, filePath: string): Promise<File> {
    const file = await this.supabase
      .from("files")
      .select("*")
      .eq("project_id", projectId)
      .eq("path", filePath)
      .single();

    if (file.error) {
      throw new Error(file.error.message);
    }

    return file.data;
  }

  async getRevisions(
    projectId: number,
    filePath: string
  ): Promise<FileRevision[]> {
    const result = await this.supabase
      .from("file_revisions")
      .select("*")
      .eq("project_id", projectId)
      .eq("path", filePath)
      .order("created_at", {
        ascending: false,
      });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data;
  }

  async getRevision(revisionId: number): Promise<FileRevision> {
    const result = await this.supabase
      .from("file_revisions")
      .select("*")
      .eq("id", revisionId)
      .single();

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data;
  }

  async createFile(newFile: NewFile) {
    let result = await this.supabase.from("files").insert(newFile);

    if (result.error) {
      throw new Error(result.error.message);
    }

    result = await this.supabase.from("file_revisions").insert(newFile);

    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  async updateFile(projectId: number, filePath: string, update: FileUpdate) {
    const updated = await this.supabase
      .from("files")
      .update(update)
      .eq("path", filePath)
      .eq("project_id", projectId)
      .select()
      .single();

    if (updated.error) {
      throw new Error(updated.error.message);
    }

    let newRevision: NewFileRevision = Object.assign({}, updated.data);
    delete newRevision["created_at"];
    delete newRevision["id"];

    const result = await this.supabase
      .from("file_revisions")
      .insert(newRevision);

    if (result.error) {
      throw new Error(result.error.message);
    }

    return updated.data;
  }

  async deleteFile(projectId: number, filePath: string) {
    const result = await this.supabase
      .from("files")
      .delete()
      .eq("path", filePath)
      .eq("project_id", projectId);
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  async getDatabases(projectId: number): Promise<Db[]> {
    const result = await await this.supabase
      .from("databases")
      .select("*")
      .eq("project_id", projectId);

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data;
  }

  async createDatabase(newDb: NewDb) {
    const result = await this.supabase.from("databases").insert(newDb);

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data;
  }

  async getDatabase(databaseId: number): Promise<Db> {
    const result = await await this.supabase
      .from("databases")
      .select("*")
      .eq("id", databaseId)
      .single();

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data;
  }

  async getDefaultDatabase(projectId: number): Promise<Db> {
    const result = await await this.supabase
      .from("databases")
      .select("*")
      .eq("project_id", projectId)
      .eq("name", `project_${projectId}_db`)
      .single();

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data;
  }
}
