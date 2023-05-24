"use client";

import { SERVER_URL } from "@/util/constants";
import { Project } from "@/util/storage";
import React, { useEffect, useState } from "react";
import PreviewRenderer from "../PreviewRenderer";
import EditorNavbar from "../EditorNavbar/EditorNavbar";
import BrowserMockup from "../BrowserMockup/BrowserMockup";
import toast, { Toaster } from "react-hot-toast";

export interface ProjectEditorProps {
  projectId: string;
}

async function getProject(projectId: string) {
  const res = await fetch(`${SERVER_URL}/api/projects/${projectId}`);
  return res.json();
}

const toastMessage = (message: string) =>
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-slate-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-slate-50 ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <img
                className="h-10 w-10 rounded-full"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixqx=6GHAjsWpt9&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80"
                alt=""
              />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-slate-50">Assistant</p>
              <p className="mt-1 text-sm text-slate-100">{message}</p>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      duration: 5000,
      position: "bottom-right",
    }
  );

function ProjectEditor({ projectId }: ProjectEditorProps) {
  const [project, setProject] = useState<Project | undefined>();
  useEffect(() => {
    getProject(projectId).then((p) => setProject(p.project));
  }, [projectId]);

  return (
    <>
      <div
        className="h-screen w-screen flex flex-col"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #ccc 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      >
        <EditorNavbar project={project} />
        <div className="flex flex-row flex-1">
          <BrowserMockup>
            {project && (
              <PreviewRenderer
                project={project}
                onUpdate={() =>
                  getProject(projectId).then((p) => setProject(p.project))
                }
                onMessage={(message) => toastMessage(message)}
              />
            )}
          </BrowserMockup>
        </div>
      </div>
      <Toaster />
    </>
  );
}

export default ProjectEditor;
