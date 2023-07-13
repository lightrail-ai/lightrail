import { ProjectWithFiles } from "@/util/storage";
import React, { useMemo, useState } from "react";
import { ReflexElement } from "react-reflex";
import { editingComponent } from "../PreviewRenderer/preview-renderer-state";
import { useRecoilValue, useSetRecoilState } from "recoil";
import Button from "../Button/Button";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import Modal from "../Modal/Modal";
import { SERVER_URL } from "@/util/constants";

export interface ComponentsListPanelProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  project: ProjectWithFiles;
  onCreateComponent: (name: string) => void;
  onComponentDeleted: () => void;
}

function ComponentsListPanel({
  isOpen,
  project,
  onCreateComponent,
  onComponentDeleted,
}: ComponentsListPanelProps) {
  const setEditingComponent = useSetRecoilState(editingComponent);
  const [deletionCandidate, setDeletionCandidate] = useState<string | null>(
    null
  );

  const orderedComponents = useMemo(() => {
    return project.files.slice().sort((a, b) => {
      if (a.path === "index") return -1;
      if (b.path === "index") return 1;

      return a.path.localeCompare(b.path);
    });
  }, [project.files]);

  async function deleteCandidateComponent() {
    if (deletionCandidate === null) return;
    const res = await fetch(
      `${SERVER_URL}/api/projects/${project.id}/files/${deletionCandidate}`,
      {
        method: "DELETE",
      }
    );
    const json = await res.json();
  }

  return (
    <ReflexElement flex={isOpen ? 0.5 : 0}>
      <div className="flex flex-col min-h-full bg-slate-50 text-slate-800 px-4 py-2">
        <div className="text-xl font-semibold">Components</div>
        <div className="space-y-2 my-4">
          <Button
            className="w-full mt-4"
            onClick={(e) => onCreateComponent("")}
          >
            + New component
          </Button>
          {orderedComponents.map((file) => (
            <div className="flex flex-row gap-2">
              <button
                className="text-red-500 hover:text-red-600 cursor-pointer hint--right hint--rounded"
                aria-label="Delete component"
                onClick={() => setDeletionCandidate(file.path)}
              >
                <FontAwesomeIcon icon={faXmarkCircle} />
              </button>
              <div
                key={file.path}
                className={classNames(
                  `flex-1 text-md px-2 py-1 bg-slate-100 rounded-md text-slate-800 cursor-pointer border-2 hover:opacity-70 hover:shadow-md active:shadow-inner hover:border-sky-300`,
                  {
                    "border-slate-300": file.path !== "index",
                    "border-green-300": file.path === "index",
                  }
                )}
                onClick={(e) => {
                  setEditingComponent({ name: file.path });
                }}
              >
                {file.path === "index" ? "index (root)" : file.path}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Modal
        visible={deletionCandidate !== null}
        onClose={() => setDeletionCandidate(null)}
        title={`Delete ${deletionCandidate}`}
        content={
          <div className="text-slate-600 font-normal">
            Are you sure you want to delete this component? Currently, this{" "}
            <b>will cause references to this component in your code to break</b>
            , and you will need to update them manually.
          </div>
        }
        actions={[
          <Button
            className="w-full mt-4"
            key={1}
            onClick={() => {
              setDeletionCandidate(null);
            }}
            secondary
          >
            Cancel
          </Button>,
          <Button
            className="w-full mt-4"
            key={0}
            onClick={() => {
              if (deletionCandidate === null) return;
              deleteCandidateComponent().then(() => {
                setDeletionCandidate(null);
                onComponentDeleted();
              });
            }}
          >
            Delete <span className="font-mono">{deletionCandidate}</span>
          </Button>,
        ]}
      />
    </ReflexElement>
  );
}

export default ComponentsListPanel;
