import { SERVER_URL } from "@/util/constants";
import { FileRevision, Project } from "@/util/storage";
import {
  faCircle,
  faDotCircle,
  faSave,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import {
  FloatingPortal,
  offset,
  safePolygon,
  useFloating,
  useHover,
  useInteractions,
} from "@floating-ui/react";
import classNames from "classnames";

export interface RevisionSelectProps {
  project: Project;
  filePath: string;
  onRevisionSelect: (revision: FileRevision | null) => void;
  currentRevision: FileRevision | null;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

function RevisionSelect({
  project,
  filePath,
  onRevisionSelect,
  currentRevision,
}: RevisionSelectProps) {
  const [loading, setLoading] = useState(false);
  const [revisions, setRevisions] = useState<FileRevision[]>([]);

  /* Hover state management */
  const [isOpen, setIsOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    middleware: [offset(8)],
    placement: "top-start",
    open: isOpen,
    onOpenChange: setIsOpen,
  });
  const hover = useHover(context, {
    handleClose: safePolygon(),
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const revisionsResult = await fetch(
        `${SERVER_URL}/api/projects/${project.id}/files/${filePath}/revisions`
      );
      const { revisions } = await revisionsResult.json();
      setRevisions(revisions);
      setLoading(false);
    })();
  }, [project, filePath]);

  const latestRevision = revisions.length > 0 ? revisions[0] : null;

  if (loading || !latestRevision) return null;

  return (
    <>
      {isOpen && (
        <FloatingPortal>
          <div
            className="z-[101] bg-slate-50 p-2 rounded-md border border-slate-300 max-h-64 overflow-auto"
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            <div className="text-sm font-semibold">Revisions</div>
            {revisions.map((r) => {
              const isCurrent = currentRevision
                ? r.id === currentRevision.id
                : r.id === latestRevision.id;
              return (
                <div
                  className={classNames(
                    "flex flex-row gap-2 items-center rounded-md py-1 my-1 px-2 border whitespace-nowrap text-sm group",
                    {
                      "cursor-pointer hover:bg-slate-100": !isCurrent,
                    }
                  )}
                  onClick={() => {
                    onRevisionSelect(r.id === latestRevision.id ? null : r);
                    setIsOpen(false);
                  }}
                >
                  {isCurrent ? (
                    <FontAwesomeIcon
                      icon={faCircle}
                      className="text-green-600"
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faUndo}
                      className="text-slate-300 group-hover:text-green-600"
                    />
                  )}
                  {formatDate(r.created_at!)}
                  {r.id === latestRevision.id && (
                    <div className="italic opacity-30">latest</div>
                  )}
                </div>
              );
            })}
          </div>
        </FloatingPortal>
      )}
      <div
        ref={refs.setReference}
        {...getReferenceProps()}
        className={classNames(
          "font-normal opacity-75 text-sm px-1 py-0.5  flex flex-row items-center gap-2 rounded-lg cursor-pointer border",
          {
            "bg-green-600 bg-opacity-10 border-green-600 text-green-600":
              currentRevision,
            "bg-slate-200 border-slate-300": !currentRevision,
            "bg-slate-300": isOpen,
          }
        )}
        title={
          currentRevision
            ? currentRevision.created_at!
            : latestRevision.created_at!
        }
      >
        {currentRevision ? (
          <div className="font-semibold">Previewing</div>
        ) : (
          <FontAwesomeIcon icon={faSave} />
        )}
        {formatDate(
          currentRevision
            ? currentRevision.created_at!
            : latestRevision.created_at!
        )}
        {!currentRevision && (
          <FontAwesomeIcon icon={faUndo} className="text-green-600" />
        )}
      </div>
    </>
  );
}

export default RevisionSelect;
