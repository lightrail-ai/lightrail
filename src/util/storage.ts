import {
  SupabaseClient,
  createRouteHandlerClient,
} from "@supabase/auth-helpers-nextjs";
import { Database } from "../supabase";

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type File = Database["public"]["Tables"]["files"]["Row"];
export type ProjectWithFiles = Project & { files: File[] };

// export async function setProject(project: Project) {
//   await supabase.from("projects").upsert(project);
// }

export class Client {
  supabase: SupabaseClient<Database>;

  constructor(options: any) {
    this.supabase = createRouteHandlerClient<Database>(options);
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

    console.log(project, files);

    return { ...project.data!, files: files.data! };
  }

  async createProject(name: string) {
    const res = await this.supabase
      .from("projects")
      .insert({ name })
      .select("id")
      .single();
    return res.data!.id;
  }

  async getFile(projectId: number, filePath: string): Promise<string> {
    const file = await this.supabase
      .from("files")
      .select("contents")
      .eq("project_id", projectId)
      .eq("path", filePath)
      .single();
    return file.data!.contents!;
  }

  async createFile(projectId: number, filePath: string, contents: string) {
    await this.supabase.from("files").insert({
      project_id: projectId,
      path: filePath,
      contents,
    });
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
