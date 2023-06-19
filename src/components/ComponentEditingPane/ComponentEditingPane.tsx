import { SERVER_URL } from "@/util/constants";
import { FileRevision, ProjectWithFiles } from "@/util/storage";
import React, { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  editingComponent,
  editingPopoverTarget,
} from "../PreviewRenderer/preview-renderer-state";
import classNames from "classnames";
import TimerProgressBar from "../TimerProgressBar/TimerProgressBar";
import CodeEditor from "../CodeEditor/CodeEditor";
import { getJSONFromStream } from "@/util/transfers";
import { ComponentCreationCallback } from "../ProjectEditor/editor-types";
import Button from "../Button/Button";
import { toast } from "react-hot-toast";
import prettier from "prettier/standalone";
import prettierBabelParser from "prettier/parser-babel";
import RevisionSelect from "../RevisionSelect/RevisionSelect";
// @ts-ignore

export interface ComponentEditingPaneProps {
  project: ProjectWithFiles;
  onUpdate: (newContent: string) => void;
  onMessage: (message: string) => void;
  onCreateComponent: (
    name: string,
    callback: ComponentCreationCallback
  ) => void;
}

function ComponentEditingPane({
  project,
  onUpdate,
  onMessage,
  onCreateComponent,
}: ComponentEditingPaneProps) {
  const [modification, setModification] = useState("");
  const editingComponentValue = useRecoilValue(editingComponent);
  const setEditingPopoverTarget = useSetRecoilState(editingPopoverTarget);
  const [loading, setLoading] = useState(false);
  const [oldCode, setOldCode] = useState<string>("");
  const [modifiedCode, setModifiedCode] = useState<string>("");
  const [selectedRevision, setSelectedRevision] = useState<FileRevision | null>(
    null
  );

  useEffect(() => {
    if (editingComponentValue?.name) {
      const file = project.files.find(
        (f) => f.path === editingComponentValue.name
      );
      let formatted;
      try {
        formatted = prettier
          .format(file?.contents!, {
            parser: "babel",
            semi: false,
            plugins: [prettierBabelParser],
          })
          .replace(/^;+|;+$/g, "");
      } catch (e) {
        console.error(e);
        formatted = file?.contents!;
      }
      setModifiedCode(formatted);
      setOldCode(formatted);
    }
  }, [project, editingComponentValue?.name]);

  async function updateComponent() {
    setLoading(true);

    const updateBody = selectedRevision
      ? {
          revision: selectedRevision.id,
        }
      : {
          modification,
          contents: oldCode === modifiedCode ? undefined : modifiedCode,
        };

    const res = await fetch(
      `${SERVER_URL}/api/projects/${project.id}/files/${editingComponentValue?.name}/contents`,
      {
        method: "PUT",
        body: JSON.stringify(updateBody),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const json = await getJSONFromStream(res);

    if (json.status === "error") {
      console.log(json);
      toast.error("Failed to edit component -- please try again!", {
        position: "bottom-center",
      });

      setSelectedRevision(null);
      setLoading(false);
      return;
    }

    onUpdate(json.file);
    if (json.message) onMessage(json.message);
    setModification("");
    setSelectedRevision(null);
    setLoading(false);
  }

  if (!editingComponentValue) {
    return null;
  }

  return (
    <div className="w-full h-full min-h-0 max-h-full flex flex-col">
      <h1
        className={classNames(
          "font-semibold text-lg flex flex-row items-center pb-4 gap-2"
        )}
      >
        <div className="bg-sky-300 rounded-lg px-2 py-0.5 text-slate-900 inline-flex justify-center items-center transition-all">{`<${editingComponentValue.name} />`}</div>
        {!loading && (
          <RevisionSelect
            project={project}
            filePath={editingComponentValue.name}
            onRevisionSelect={(revision) => {
              setSelectedRevision(revision);
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
          onClick={() => setEditingPopoverTarget(null)}
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
            <div className="italic font-semibold text-sm ">
              {selectedRevision ? (
                <span className="text-green-600">Preview</span>
              ) : (
                "Edit Directly"
              )}
            </div>
            <CodeEditor
              readonly={selectedRevision !== null}
              project={project}
              value={selectedRevision ? selectedRevision.contents! : oldCode}
              className={classNames(
                "w-full flex-1 min-h-0 bg-slate-200 shadow-inner rounded-lg"
              )}
              onValueChange={(newValue) => setModifiedCode(newValue)}
              onCreateComponent={onCreateComponent}
            />
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
                  Revert to{" "}
                  {new Date(selectedRevision.created_at!).toLocaleString()}
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
                  Update
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
