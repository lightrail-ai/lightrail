import { Project } from "@/util/storage";
import React from "react";
import ConfigControls from "../ConfigControls/ConfigControls";
import ProjectExporter from "../ProjectExporter/ProjectExporter";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faEdit,
  faPenToSquare,
  faWindowMaximize,
} from "@fortawesome/free-solid-svg-icons";
import IconToggle from "../IconToggle/IconToggle";

export interface EditorNavbarProps {
  project: Project | undefined;
  isPreviewing: boolean;
  onTogglePreview: () => void;
}

function EditorNavbar({
  project,
  isPreviewing,
  onTogglePreview,
}: EditorNavbarProps) {
  return (
    <div className="p-4 bg-slate-900 shadow-md flex flex-row gap-6 items-center">
      <Link
        href="/projects"
        className="text-slate-100 opacity-50 hover:opacity-100"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
      </Link>
      <span className="font-semibold text-slate-100">{project?.name}</span>
      <div className="flex-1" />
      <IconToggle
        trueIcon={faWindowMaximize}
        falseIcon={faPenToSquare}
        onToggle={onTogglePreview}
        value={isPreviewing}
      />
      {project && <ProjectExporter project={project} />}
      <ConfigControls />
    </div>
  );
}

export default EditorNavbar;
