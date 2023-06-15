import { Project } from "@/util/storage";
import React from "react";
import ConfigControls from "../ConfigControls/ConfigControls";
import ProjectExporter from "../ProjectExporter/ProjectExporter";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faEye,
  faList,
  faPenToSquare,
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
    <div className="px-4 py-1 bg-slate-100 border-b border-b-slate-300 flex flex-row gap-6 items-center">
      <Link
        href="/projects"
        className="text-slate-800 opacity-50 hover:opacity-100"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
      </Link>
      <span className="font-semibold text-slate-800 inline-flex flex-row items-center gap-2">
        {project?.name}{" "}
        {project?.type && (
          <div className="bg-slate-400 bg-opacity-20 text-xs px-2 py-0.5 rounded-lg text-slate-500">
            {project.type}
          </div>
        )}
      </span>

      <div className="flex-1" />
      <IconToggle
        trueIcon={faEye}
        falseIcon={faPenToSquare}
        onToggle={onTogglePreview}
        value={isPreviewing}
      />
      {project && <ProjectExporter project={project} />}
      {/* <ConfigControls /> */}
      {!isPreviewing && (
        <div
          onClick={onToggleComponentList}
          className={classNames(
            `text-slate-700 hover:text-slate-900 cursor-pointer rounded-md p-2`,
            {
              "bg-slate-700 bg-opacity-20": isShowingComponentList,
            }
          )}
        >
          <FontAwesomeIcon icon={faList} />
        </div>
      )}
    </div>
  );
}

export default EditorNavbar;
