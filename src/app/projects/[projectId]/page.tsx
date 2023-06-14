import ProjectEditor from "@/components/ProjectEditor/ProjectEditor";

export const metadata = {
  title: "Lightrail – Editor",
};

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
