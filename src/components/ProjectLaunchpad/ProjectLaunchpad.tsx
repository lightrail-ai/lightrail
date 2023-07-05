"use client";
import React, { useEffect, useState } from "react";
import ProjectCreationModal from "../ProjectCreationModal/ProjectCreationModal";
import FirstProjectFlow from "../FirstProjectFlow/FirstProjectFlow";
import { Project } from "@/util/storage";
import { SERVER_URL } from "@/util/constants";
import Loader from "../Loader/Loader";
import MobileBlockingModal from "../MobileBlockingModal/MobileBlockingModal";
import AccountNavbar from "../AccountNavbar/AccountNavbar";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { sessionState } from "../SessionDataProvider/session-data-state";
import { useRecoilValue } from "recoil";
import LinksFooter from "../LinksFooter/LinksFooter";

export interface ProjectLaunchpadProps {}

function ProjectLaunchpad({}: ProjectLaunchpadProps) {
  const [projectCreationModalVisible, setProjectCreationModalVisible] =
    useState(false);
  let { session, loading: loadingAuth } = useRecoilValue(sessionState);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetch(`${SERVER_URL}/api/projects`)
        .then((res) => res.json())
        .then(({ projects }) => {
          setProjects(
            projects.sort(
              (a: Project, b: Project) =>
                new Date(b.created_at!).getTime() -
                new Date(a.created_at!).getTime()
            ) ?? []
          );
          setProjectsLoading(false);
        });
    }
  }, [session]);

  if (loadingAuth) return <></>;

  if (session) {
    return (
      <div className="flex flex-col h-full">
        <AccountNavbar />
        <div className="px-24 flex-1 min-h-0 overflow-auto">
          {projectsLoading ? (
            <Loader className="text-gray-200 fill-black" />
          ) : (
            <div className="flex gap-4 flex-wrap">
              <div
                onClick={() => setProjectCreationModalVisible(true)}
                className="inline-flex flex-col justify-center items-center px-6 py-4 bg-slate-200 rounded-md text-slate-500 cursor-pointer border-2 border-slate-300 hover:opacity-60"
              >
                <div className="text-2xl font-bold">+</div>
                <div className="text-slate-400 italic">New Project</div>
              </div>
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="inline-flex flex-col justify-center items-center px-6 py-4 bg-slate-100 rounded-md text-slate-500 cursor-pointer border-2 border-slate-300 hover:opacity-70 hover:shadow-md active:shadow-inner hover:border-sky-300"
                >
                  <div className="text-slate-800 text-xl pb-1">
                    {project.name}
                  </div>
                  <div className="text-slate-400 italic text-sm">
                    {new Date(project.created_at!).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
          <ProjectCreationModal
            onClose={() => setProjectCreationModalVisible(false)}
            visible={projectCreationModalVisible}
          />
          <MobileBlockingModal />
        </div>
        <LinksFooter />
        <Toaster />
      </div>
    );
  } else {
    return (
      <>
        <FirstProjectFlow />
        <MobileBlockingModal />
        <Toaster />
      </>
    );
  }
}

export default ProjectLaunchpad;
