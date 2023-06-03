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

export interface ProjectLaunchpadProps {}

function ProjectLaunchpad({}: ProjectLaunchpadProps) {
  const supabase = createClientComponentClient<Database>();
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [projectCreationModalVisible, setProjectCreationModalVisible] =
    useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
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
          setProjects(projects);
        });
    }
  }, [session]);

  if (!authChecked) return <></>;

  if (session) {
    return (
      <div className="px-24">
        <div className="flex gap-4 flex-wrap">
          {projects.map((project) => (
            <div
              onClick={() => router.push(`/projects/${project.id}`)}
              className="inline-flex flex-col justify-center items-center px-6 py-4 bg-slate-100 rounded-md text-slate-500 cursor-pointer border-2 border-slate-300 hover:opacity-70"
            >
              <div className="text-slate-800 text-xl pb-1">{project.name}</div>
              <div className="text-slate-400 italic text-sm">
                {new Date(project.created_at!).toLocaleDateString()}
              </div>
            </div>
          ))}
          <div
            onClick={() => setProjectCreationModalVisible(true)}
            className="inline-flex flex-col justify-center items-center px-6 py-4 bg-slate-200 rounded-md text-slate-500 cursor-pointer border-2 border-slate-300 hover:opacity-80"
          >
            <div className="text-2xl font-bold">+</div>
            <div className="text-slate-400 italic">New Project</div>
          </div>
        </div>
        <ProjectCreationModal
          onClose={() => setProjectCreationModalVisible(false)}
          visible={projectCreationModalVisible}
        />
      </div>
    );
  } else {
    return <FirstProjectFlow />;
  }
}

export default ProjectLaunchpad;
