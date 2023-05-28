import AccountNavbar from "@/components/AccountNavbar/AccountNavbar";
import ProjectLaunchpad from "@/components/ProjectLaunchpad/ProjectLaunchpad";

export default async function Projects() {
  return (
    <main className="bg-slate-50 h-screen">
      <AccountNavbar />
      <ProjectLaunchpad />
    </main>
  );
}
