import { SERVER_URL } from "@/util/constants";
import { FileRevision, ProjectWithFiles } from "@/util/storage";
import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { editingComponent } from "../PreviewRenderer/preview-renderer-state";
import classNames from "classnames";
import TimerProgressBar from "../TimerProgressBar/TimerProgressBar";
import CodeEditor from "../CodeEditor/CodeEditor";
import { getJSONFromStream } from "@/util/transfers";
import { ComponentCreationCallback } from "../ProjectEditor/editor-types";
import Button from "../Button/Button";
import { toast } from "react-hot-toast";
import RevisionSelect from "../RevisionSelect/RevisionSelect";
import { formatComponentTree, formatCreationDate } from "@/util/util";
import { analytics } from "@/util/analytics";
import { useHotkeys } from "react-hotkeys-hook";
import { type UpdateProposal } from "../UpdateProposalModal";
import ComponentNameEditor from "../ComponentNameEditor/ComponentNameEditor";
import DiffView from "../DiffView/DiffView";

export interface ComponentEditingPaneProps {
  project: ProjectWithFiles;
  onUpdate: () => void;
  onProposal: (proposal: UpdateProposal) => void;
  onCreateComponent: (
    name: string,
    callback: ComponentCreationCallback
  ) => void;
}

function ComponentEditingPane({
  project,
  onUpdate,
  onProposal,
  onCreateComponent,
}: ComponentEditingPaneProps) {
  const [modification, setModification] = useState("");
  const [editingComponentValue, setEditingComponentValue] =
    useRecoilState(editingComponent);
  const [loading, setLoading] = useState(false);
  const [oldCode, setOldCode] = useState<string>("");
  const [modifiedCode, setModifiedCode] = useState<string>("");
  const [selectedRevision, setSelectedRevision] = useState<FileRevision | null>(
    null
  );

  useEffect(() => {
    setSelectedRevision(null);
    setModification("");
  }, [editingComponentValue?.name]);

  useHotkeys(
    "ctrl+s, meta+s, ctrl+enter, meta+enter",
    (e) => {
      if (
        !loading &&
        (selectedRevision || modification || modifiedCode !== oldCode)
      ) {
        updateComponent();
        e.preventDefault();
        e.stopPropagation();
      }
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [loading, selectedRevision, modification, modifiedCode, oldCode]
  );

  useEffect(() => {
    if (editingComponentValue?.name) {
      const file = project.files.find(
        (f) => f.path === editingComponentValue.name
      );
      let formatted = formatComponentTree(file?.contents!);
      setModifiedCode(formatted);
      setOldCode(formatted);
    }
  }, [project, editingComponentValue?.name]);

  async function updateComponent() {
    setLoading(true);

    analytics.track("Component Update Requested", {
      projectId: project.id,
      componentName: editingComponentValue?.name,
    });

    try {
      if (selectedRevision || modifiedCode !== oldCode) {
        // Update directly, without prompting LLM
        const updateBody = selectedRevision
          ? { revision: selectedRevision.id }
          : { contents: modifiedCode };
        const res = await fetch(
          `${SERVER_URL}/api/projects/${project.id}/files/${editingComponentValue?.name}`,
          {
            method: "PUT",
            body: JSON.stringify(updateBody),
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
        const json = await res.json();
        if (json.status === "error") {
          console.error(json);
          throw new Error(json.error);
        } else {
          onUpdate();
          toast.success("Component updated!", {
            position: "bottom-center",
          });
        }
      } else if (modification) {
        // Update via LLM

        const res = await fetch(
          `${SERVER_URL}/api/projects/${project.id}/files/${editingComponentValue?.name}/revisions`,
          {
            method: "POST",
            body: JSON.stringify({
              modification,
            }),
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        const json = await getJSONFromStream(res);
        if (json.status === "error") {
          console.error(json);
          throw new Error(json.error);
        }

        const file = project.files.find(
          (f) => f.path === editingComponentValue?.name
        );

        if (file && json.update) {
          onProposal({
            message: json.message,
            file,
            request: {
              modification,
            },
            update: json.update,
          });
        }
      }
    } catch (e) {
      toast.error("Failed to edit component -- please try again!", {
        position: "bottom-center",
      });
    } finally {
      setSelectedRevision(null);
      setLoading(false);
    }
  }

  async function updateComponentName(newName: string) {
    setLoading(true);

    analytics.track("Component Renamed", {
      projectId: project.id,
      componentName: editingComponentValue?.name,
    });

    try {
      const updateBody = { path: newName };
      const res = await fetch(
        `${SERVER_URL}/api/projects/${project.id}/files/${editingComponentValue?.name}`,
        {
          method: "PUT",
          body: JSON.stringify(updateBody),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      const json = await res.json();
      if (json.status === "error") {
        console.error(json);
        throw new Error(json.error);
      } else {
        onUpdate();
        setEditingComponentValue({
          name: newName,
        });
        toast.success("Component updated!", {
          position: "bottom-center",
        });
      }
    } catch (e) {
      toast.error("Failed to update component -- please try again!", {
        position: "bottom-center",
      });
    } finally {
      setSelectedRevision(null);
      setLoading(false);
    }
  }

  if (!editingComponentValue) {
    return null;
  }

  const commandOrControlSymbol = navigator.platform.includes("Mac")
    ? "⌘"
    : "Ctrl";

  return (
    <div className="w-full h-full min-h-0 max-h-full flex flex-col">
      <h1
        className={classNames(
          "font-semibold text-lg flex flex-row items-center pb-4 gap-2"
        )}
      >
        <ComponentNameEditor
          name={editingComponentValue.name}
          onNameChange={updateComponentName}
        />
        {!loading && (
          <RevisionSelect
            project={project}
            filePath={editingComponentValue.name}
            onRevisionSelect={(revision) => {
              if (revision) {
                setSelectedRevision({
                  ...revision,
                  contents: formatComponentTree(revision.contents!),
                });
              } else {
                setSelectedRevision(null);
              }
            }}
            currentRevision={selectedRevision}
          />
        )}
        <div className="flex-1 px-4 py-0.5 text-sm font-semibold">
          {loading && (
            <TimerProgressBar duration={20} caption="Rewriting component..." />
          )}
        </div>
        <button
          className="text-slate-500 hover:text-slate-600 text-2xl"
          onClick={() => setEditingComponentValue(null)}
        >
          ×
        </button>
      </h1>
      <div
        className={classNames("flex-1 min-h-0 flex flex-row gap-4", {
          "opacity-40": loading,
        })}
      >
        {!selectedRevision && (
          <div className="flex flex-1 min-w-[100px] flex-col min-h-0 ">
            <div className="italic font-semibold text-sm">Edit via AI</div>
            <textarea
              className={classNames(
                "flex-1 transition-all w-full bg-slate-200 shadow-inner text-slate-900 rounded-lg p-2"
              )}
              value={modification}
              placeholder="Describe desired changes..."
              onChange={(e) => setModification(e.target.value)}
              disabled={loading || selectedRevision !== null}
            />
          </div>
        )}
        <div className="flex-[4] lg:flex-[5] flex flex-col lg:flex-row gap-4 min-w-0">
          <div className="flex-[4] overflow-auto rounded-lg min-h-0 flex flex-col">
            {selectedRevision ? (
              <>
                <DiffView
                  oldFile={{
                    name: `${editingComponentValue.name} (current)`,
                    contents: oldCode,
                  }}
                  newFile={{
                    name: `${editingComponentValue.name} (${formatCreationDate(
                      selectedRevision.created_at!
                    )})`,
                    contents: selectedRevision.contents!,
                  }}
                />
              </>
            ) : (
              <>
                <div className="italic font-semibold text-sm ">
                  Edit Directly
                </div>

                <CodeEditor
                  type="jsx"
                  project={project}
                  value={oldCode}
                  className={classNames(
                    "w-full flex-1 min-h-0 bg-slate-200 shadow-inner rounded-lg"
                  )}
                  onComponentClick={(name) => {
                    setEditingComponentValue({ name });
                  }}
                  onValueChange={(newValue) => setModifiedCode(newValue)}
                  onCreateComponent={onCreateComponent}
                />
              </>
            )}
          </div>
          <div className="flex flex-row-reverse lg:flex-1 lg:flex-col gap-4 lg:gap-0">
            <div className="italic font-semibold text-sm text-transparent hidden lg:block">
              Actions
            </div>
            {selectedRevision ? (
              <>
                <Button
                  className="flex-1 lg:w-full lg:flex-initial bg-green-600 text-white hover:bg-green-800 active:bg-green-500"
                  onClick={updateComponent}
                  custom
                >
                  <span className="font-normal flex flex-row flex-wrap justify-center gap-1">
                    <div>
                      Revert{" "}
                      <span className="font-mono font-semibold">
                        {editingComponentValue.name}
                      </span>{" "}
                    </div>
                    <div>
                      to{" "}
                      <span className="font-semibold">
                        {formatCreationDate(selectedRevision.created_at!)}
                      </span>
                    </div>
                  </span>
                </Button>
                <Button
                  className="flex-1 lg:w-full lg:mt-4 lg:flex-initial"
                  onClick={() => {
                    setSelectedRevision(null);
                  }}
                  disabled={loading}
                  secondary
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="flex-1 lg:w-full lg:flex-initial"
                  onClick={updateComponent}
                  disabled={
                    loading || (modifiedCode === oldCode && !modification)
                  }
                >
                  Update{" "}
                  <span className="opacity-50 pl-2 font-mono font-normal">
                    {commandOrControlSymbol}+⏎
                  </span>
                </Button>
                <Button
                  className="flex-1 lg:w-full lg:mt-4 lg:flex-initial"
                  onClick={() => {
                    const tempOldCode = oldCode;
                    setModifiedCode(oldCode);
                    setModification("");
                    setOldCode("");
                    setTimeout(() => {
                      setOldCode(tempOldCode);
                    }, 1);
                  }}
                  disabled={
                    loading || (modifiedCode === oldCode && !modification)
                  }
                  secondary
                >
                  Reset
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComponentEditingPane;
