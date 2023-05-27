import { createClient } from "@supabase/supabase-js";
import { Database } from "../supabase";

const supabaseUrl = process.env.SUPABASE_ENDPOINT!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type File = Database["public"]["Tables"]["files"]["Row"];
export type ProjectWithFiles = Project & { files: File[] };

export async function getProject(projectId: number): Promise<ProjectWithFiles> {
  let project = await supabase
    .from("projects")
    .select()
    .eq("id", projectId)
    .single();
  let files = await supabase.from("files").select().eq("project_id", projectId);

  return { ...project.data!, files: files.data! };
}

// export async function setProject(project: Project) {
//   await supabase.from("projects").upsert(project);
// }

export async function createProject(name: string) {
  const res = await supabase
    .from("projects")
    .insert({ name })
    .select("id")
    .single();
  return res.data!.id;
}

export async function getFile(
  projectId: number,
  filePath: string
): Promise<string> {
  const file = await supabase
    .from("files")
    .select("contents")
    .eq("project_id", projectId)
    .eq("path", filePath)
    .single();
  return file.data!.contents!;
}

export async function createFile(
  projectId: number,
  filePath: string,
  contents: string
) {
  await supabase.from("files").insert({
    project_id: projectId,
    path: filePath,
    contents,
  });
}

export async function updateFile(
  projectId: number,
  filePath: string,
  contents: string
) {
  const updated = await supabase
    .from("files")
    .update({ contents })
    .eq("path", filePath)
    .eq("project_id", projectId)
    .select()
    .single();

  return updated.data!;
}
