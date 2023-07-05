import PreviewFrame from "@/components/PreviewFrame/PreviewFrame";

export const metadata = {
  title: "Lightrail – Theme Preview",
};

export default async function Projects({
  params,
  searchParams,
}: {
  params: { themeName: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <main className="h-screen w-screen">
      <PreviewFrame renderCount={Date.now()} theme={searchParams} noOverlay />
    </main>
  );
}
