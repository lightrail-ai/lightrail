import { SERVER_URL } from "@/util/constants";
import { ProjectWithFiles } from "@/util/storage";
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

  useEffect(() => {
    if (editingComponentValue?.name) {
      const file = project.files.find(
        (f) => f.path === editingComponentValue.name
      );
      const formatted = file?.contents!; // TODO: Add formatter
      setModifiedCode(formatted);
      setOldCode(formatted);
    }
  }, [project, editingComponentValue?.name]);

  async function updateComponent() {
    setLoading(true);

    const res = await fetch(
      `${SERVER_URL}/api/projects/${project.id}/files/${editingComponentValue?.name}/contents`,
      {
        method: "PUT",
        body: JSON.stringify({
          modification,
          contents: oldCode === modifiedCode ? undefined : modifiedCode,
        }),
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
      setLoading(false);
      return;
    }

    onUpdate(json.file);
    if (json.message) onMessage(json.message);
    setModification("");
    setLoading(false);
  }

  if (!editingComponentValue) {
    return null;
  }

  return (
    <div className="w-full h-full min-h-0 max-h-full flex flex-col">
      <h1 className={classNames("font-semibold text-lg flex flex-row pb-4")}>
        <div className="bg-sky-300 rounded-lg px-2 py-0.5 text-slate-900 inline-flex justify-center items-center transition-all">{`<${editingComponentValue.name} />`}</div>
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
        <div className="flex flex-1 min-w-[100px] flex-col min-h-0 ">
          <div className="italic font-semibold text-sm">Edit via AI</div>
          <textarea
            className={classNames(
              "flex-1 transition-all w-full bg-slate-200 shadow-inner text-slate-900 rounded-lg p-2"
            )}
            value={modification}
            placeholder="Describe desired changes..."
            onChange={(e) => setModification(e.target.value)}
            disabled={loading}
          />
        </div>
        {/* <div
          className={classNames(
            "transition-all overflow-hidden flex items-center justify-center text-center",
            {
              "h-0": !loading,
              "h-16": loading,
            }
          )}
        >
          {loading && (
            <TimerProgressBar duration={20} caption="Rewriting component..." />
          )}
        </div> */}
        <div className="flex-[4] lg:flex-[5] flex flex-col lg:flex-row gap-4 min-w-0">
          <div className="flex-[4] overflow-auto rounded-lg min-h-0 flex flex-col">
            <div className="italic font-semibold text-sm ">Edit Directly</div>
            <CodeEditor
              project={project}
              value={oldCode}
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
            <Button
              className="flex-1 lg:w-full lg:flex-initial"
              onClick={updateComponent}
              disabled={loading || (modifiedCode === oldCode && !modification)}
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
              disabled={loading || (modifiedCode === oldCode && !modification)}
              secondary
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComponentEditingPane;
