import { Project } from "@/util/storage";
import React from "react";
import ConfigControls from "../ConfigControls/ConfigControls";
import ProjectExporter from "../ProjectExporter/ProjectExporter";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faEdit,
  faList,
  faPenToSquare,
  faWindowMaximize,
} from "@fortawesome/free-solid-svg-icons";
import IconToggle from "../IconToggle/IconToggle";
import classNames from "classnames";

export interface EditorNavbarProps {
  project: Project | undefined;
  isPreviewing: boolean;
  onTogglePreview: () => void;
  onToggleComponentList: () => void;
  isShowingComponentList: boolean;
}

function EditorNavbar({
  project,
  isPreviewing,
  onTogglePreview,
  onToggleComponentList,
  isShowingComponentList,
}: EditorNavbarProps) {
  return (
    <div className="p-4 bg-slate-900 shadow-md flex flex-row gap-6 items-center">
      <Link
        href="/projects"
        className="text-slate-100 opacity-50 hover:opacity-100"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
      </Link>
      <span className="font-semibold text-slate-100 inline-flex flex-row items-center gap-2">
        {project?.name}{" "}
        {project?.type && (
          <div className="bg-slate-100 bg-opacity-30 text-xs px-2 py-0.5 rounded-lg text-slate-200">
            {project.type}
          </div>
        )}
      </span>

      <div className="flex-1" />
      <IconToggle
        trueIcon={faWindowMaximize}
        falseIcon={faPenToSquare}
        onToggle={onTogglePreview}
        value={isPreviewing}
      />
      {project && <ProjectExporter project={project} />}
      {/* <ConfigControls /> */}
      <div
        className={classNames(
          `text-slate-300 hover:text-white cursor-pointer rounded-md p-2`,
          {
            "bg-slate-100 bg-opacity-20": isShowingComponentList,
          }
        )}
      >
        <FontAwesomeIcon icon={faList} onClick={onToggleComponentList} />
      </div>
    </div>
  );
}

export default EditorNavbar;
