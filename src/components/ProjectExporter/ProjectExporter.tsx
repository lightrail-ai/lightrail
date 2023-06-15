import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileArrowDown,
  faFileExport,
} from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import { Project } from "@/util/storage";
import { SERVER_URL } from "@/util/constants";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export interface ProjectExporterProps {
  project: Project;
}

async function fillZip(zip: JSZip, contents: any[]) {
  for (const entry of contents) {
    if (entry.url) {
      const r = await fetch(entry.url);
      const content = await r.text();
      zip.file(entry.name, content);
    } else if (entry.children) {
      const dir = zip.folder(entry.name)!;
      await fillZip(dir, entry.children);
    }
  }
}

function ProjectExporter({ project }: ProjectExporterProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function exportNextJs() {
    setLoading(true);
    setOpen(false);
    const r = await fetch(`${SERVER_URL}/api/projects/${project.id}/export`);
    const { contents } = await r.json();
    let zip = new JSZip();
    await fillZip(zip, contents);
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(
      blob,
      `${project.name.toLowerCase().replaceAll(/[^a-z]+/g, "-")}-nextjs.zip`
    );
    setLoading(false);
  }

  return (
    <div className="text-slate-700 hover:text-slate-900 cursor-pointer relative">
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <FontAwesomeIcon
          icon={faFileArrowDown}
          onClick={() => setOpen(!open)}
        />
      )}
      {open && (
        <div className="absolute right-0 bg-slate-50 z-[60] p-2 rounded-md border border-slate-300">
          <button
            onClick={exportNextJs}
            className="flex flex-row gap-2 items-center hover:bg-slate-400 rounded-md py-1 px-2 hover:bg-opacity-20 cursor-pointer whitespace-nowrap"
          >
            <FontAwesomeIcon icon={faFileExport} />
            Export as Next.js app...
          </button>
        </div>
      )}
    </div>
  );
}

export default ProjectExporter;
