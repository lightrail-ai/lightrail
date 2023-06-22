import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDiagramProject,
  faFileArrowDown,
  faFileExport,
  faFolder,
} from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import { Project } from "@/util/storage";
import { SERVER_URL } from "@/util/constants";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { analytics } from "@/util/analytics";
import {
  FloatingPortal,
  offset,
  safePolygon,
  useFloating,
  useHover,
  useInteractions,
} from "@floating-ui/react";
import Loader from "../Loader/Loader";

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
  const [loading, setLoading] = useState(false);

  /* Hover state management */
  const [isOpen, setIsOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    middleware: [offset(8)],
    placement: "bottom-end",
    open: isOpen,
    onOpenChange: setIsOpen,
  });
  const hover = useHover(context, {
    handleClose: safePolygon(),
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  async function exportNextJs() {
    setLoading(true);
    setIsOpen(false);

    analytics.track("Project Export Requested", {
      projectId: project.id,
      format: "nextjs",
    });

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

  async function exportComponentFile() {
    setLoading(true);
    setIsOpen(false);

    analytics.track("Project Export Requested", {
      projectId: project.id,
      format: "component file",
    });

    const r = await fetch(
      `${SERVER_URL}/api/projects/${project.id}/export/files/${project.name}`
    );
    const blob = await r.blob();
    saveAs(blob, `${project.name}.jsx`);

    setLoading(false);
  }

  async function exportComponentFolder() {
    setLoading(true);
    setIsOpen(false);

    analytics.track("Project Export Requested", {
      projectId: project.id,
      format: "component folder",
    });

    const zip = new JSZip();
    const folder = zip.folder(project.name);
    const mainComponentFileContents = await fetch(
      `${SERVER_URL}/api/projects/${project.id}/export/files/${project.name}`
    );
    folder?.file(`${project.name}.jsx`, await mainComponentFileContents.text());
    folder?.file(
      "index.js",
      `export { default } from './${project.name}';\nexport * from './${project.name}'\n`
    );
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(
      blob,
      `${project.name.toLowerCase().replaceAll(/[^a-z]+/g, "-")}-component.zip`
    );

    setLoading(false);
  }

  return (
    <div className="text-slate-700 hover:text-slate-900 cursor-pointer relative">
      {loading ? (
        <Loader className="text-gray-200 fill-slate-900 h-4 w-4" />
      ) : (
        <FontAwesomeIcon
          icon={faFileArrowDown}
          ref={refs.setReference}
          {...getReferenceProps()}
        />
      )}
      {isOpen && (
        <FloatingPortal>
          <div
            className="bg-slate-50 z-[60] p-2 rounded-md border border-slate-300"
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            <button
              onClick={exportNextJs}
              className="flex flex-row gap-2 items-center hover:bg-slate-400 rounded-md py-1 px-2 hover:bg-opacity-20 cursor-pointer whitespace-nowrap w-full"
            >
              <FontAwesomeIcon icon={faDiagramProject} />
              Export Project (Next.js)...
            </button>
            {project.type === "component" && (
              <>
                {" "}
                <button
                  onClick={exportComponentFile}
                  className="flex flex-row gap-2 items-center hover:bg-slate-400 rounded-md py-1 px-2 hover:bg-opacity-20 cursor-pointer whitespace-nowrap w-full "
                >
                  <FontAwesomeIcon icon={faFileExport} />
                  Export Component as File...
                </button>
                <button
                  onClick={exportComponentFolder}
                  className="flex flex-row gap-2 items-center hover:bg-slate-400 rounded-md py-1 px-2 hover:bg-opacity-20 cursor-pointer whitespace-nowrap w-full"
                >
                  <FontAwesomeIcon icon={faFolder} />
                  Export Component as Folder...
                </button>
              </>
            )}
          </div>
        </FloatingPortal>
      )}
    </div>
  );
}

export default ProjectExporter;
