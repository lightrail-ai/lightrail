import { Project } from "@/util/storage";
import React from "react";

export interface EditorNavbarProps {
  project: Project | undefined;
}

function EditorNavbar({ project }: EditorNavbarProps) {
  return (
    <div className="p-4 bg-slate-900 shadow-md">
      <span className="font-semibold text-slate-100">{project?.name}</span>
    </div>
  );
}

export default EditorNavbar;
