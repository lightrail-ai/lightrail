"use client";
import { Database } from "@/supabase";
import {
  Session,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import React, { useEffect, useState } from "react";
import AuthModal from "../AuthModal/AuthModal";
import ProjectCreationModal from "../ProjectCreationModal/ProjectCreationModal";
import FirstProjectFlow from "../FirstProjectFlow/FirstProjectFlow";
import { Project } from "@/util/storage";
import { SERVER_URL } from "@/util/constants";
import { useRouter } from "next/navigation";
import Loader from "../Loader/Loader";
import MobileBlockingModal from "../MobileBlockingModal/MobileBlockingModal";
import AccountNavbar from "../AccountNavbar/AccountNavbar";
import Image from "next/image";
import github from "@/assets/github-mark.svg";
import Link from "next/link";
import { Toaster } from "react-hot-toast";

export interface ProjectLaunchpadProps {}

function ProjectLaunchpad({}: ProjectLaunchpadProps) {
  const supabase = createClientComponentClient<Database>();
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [projectCreationModalVisible, setProjectCreationModalVisible] =
    useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error(error);
      } else {
        setSession(session);
      }
      setAuthChecked(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetch(`${SERVER_URL}/api/projects`)
        .then((res) => res.json())
        .then(({ projects }) => {
          setProjects(projects ?? []);
          setProjectsLoading(false);
        });
    }
  }, [session]);

  if (!authChecked) return <></>;

  if (session) {
    return (
      <div className="flex flex-col h-full">
        <AccountNavbar />
        <div className="px-24 flex-1">
          {projectsLoading ? (
            <Loader className="text-gray-200 fill-black" />
          ) : (
            <div className="flex gap-4 flex-wrap">
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
              <div
                onClick={() => setProjectCreationModalVisible(true)}
                className="inline-flex flex-col justify-center items-center px-6 py-4 bg-slate-200 rounded-md text-slate-500 cursor-pointer border-2 border-slate-300 hover:opacity-60"
              >
                <div className="text-2xl font-bold">+</div>
                <div className="text-slate-400 italic">New Project</div>
              </div>
            </div>
          )}
          <ProjectCreationModal
            onClose={() => setProjectCreationModalVisible(false)}
            visible={projectCreationModalVisible}
          />
          <MobileBlockingModal />
        </div>
        <div className="flex flex-row justify-center pb-12 text-lg text-black">
          <a
            href="https://github.com/vishnumenon/lightrail"
            className="opacity-30 hover:opacity-60 cursor-pointer"
          >
            <Image src={github} alt={"Github Repo"} width={48} />
          </a>
        </div>
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
