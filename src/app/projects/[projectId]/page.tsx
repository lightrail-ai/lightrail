import ProjectEditor from "@/components/ProjectEditor/ProjectEditor";

export default async function Project({
  params,
}: {
  params: { projectId: string };
}) {
  return (
    <main>
      <ProjectEditor projectId={params.projectId} />
    </main>
  );
}
