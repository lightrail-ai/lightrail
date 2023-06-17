import {
  SupabaseClient,
  createRouteHandlerClient,
} from "@supabase/auth-helpers-nextjs";
import { Database } from "../supabase";

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type File = Database["public"]["Tables"]["files"]["Row"];
export type ProjectWithFiles = Project & { files: File[] };
export interface FileStateItem {
  name: string;
  initial: any;
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

  async createFile(
    projectId: number,
    filePath: string,
    contents: string,
    state?: any
  ) {
    const result = await this.supabase.from("files").insert({
      project_id: projectId,
      path: filePath,
      contents,
      state,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  async updateFile(projectId: number, filePath: string, contents: string) {
    const updated = await this.supabase
      .from("files")
      .update({ contents })
      .eq("path", filePath)
      .eq("project_id", projectId)
      .select()
      .single();

    return updated.data!;
  }
}
