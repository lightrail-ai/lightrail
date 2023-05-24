import { SERVER_URL } from "@/util/constants";
import { Project } from "@/util/storage";
import React, { useEffect, useState } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-jsx";
import "prismjs/themes/prism-solarizedlight.css";
import xmlFormat from "xml-formatter";
import { useRecoilValue } from "recoil";
import { editingComponent } from "../PreviewRenderer/preview-renderer-state";
import classNames from "classnames";
import Loader from "../Loader/Loader";

export interface ComponentEditingPaneProps {
  project: Project;
  onUpdate: (newContent: string) => void;
  onMessage: (message: string) => void;
}

function ComponentEditingPane({
  project,
  onUpdate,
  onMessage,
}: ComponentEditingPaneProps) {
  const [modification, setModification] = useState("");
  const editingComponentValue = useRecoilValue(editingComponent);
  const [loading, setLoading] = useState(false);
  const [currentCode, setCurrentCode] = useState<string>("");

  useEffect(() => {
    if (editingComponentValue?.name) {
      setCurrentCode(xmlFormat(project.files[editingComponentValue.name]));
    }
  }, [project, editingComponentValue?.name]);

  async function updateComponent() {
    setLoading(true);

    const res = await fetch(
      `${SERVER_URL}/api/projects/${project.id}/files/${editingComponentValue?.name}`,
      {
        method: "PUT",
        body: JSON.stringify({
          modification,
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    const json = await res.json();
    onUpdate(json.file);
    if (json.message) onMessage(json.message);
    setModification("");
    setLoading(false);
  }

  if (!editingComponentValue) {
    return null;
  }

  return (
    <div>
      <h1
        className={classNames("font-semibold text-lg", {
          "pb-4": !loading,
        })}
      >
        {editingComponentValue.name}
      </h1>
      <textarea
        className={classNames(
          "transition-all w-full bg-slate-50 shadow-inner text-slate-900 rounded-lg",
          {
            "h-0 p-0 overflow-hidden": loading,
            "p-2": !loading,
          }
        )}
        value={modification}
        placeholder="Describe changes..."
        onChange={(e) => setModification(e.target.value)}
        disabled={loading}
      />
      <div
        className={classNames(
          "transition-all overflow-hidden flex items-center justify-center text-center",
          {
            "h-0": !loading,
            "h-16": loading,
          }
        )}
      >
        {loading && <Loader />}
      </div>
      <Editor
        onValueChange={setCurrentCode}
        highlight={(code) => highlight(code, languages.jsx, "jsx")}
        padding={8}
        className={classNames(
          "w-full bg-slate-50 shadow-inner text-slate-900 rounded-lg mt-2 mb-4",
          {
            "h-0 p-0": loading,
          }
        )}
        value={currentCode!}
        disabled={loading}
      />
      <button
        className="w-full bg-slate-50 hover:bg-slate-200 active:bg-slate-300 shadow-md text-slate-900 p-1 rounded-lg disabled:opacity-20 font-semibold"
        onClick={updateComponent}
        disabled={loading}
      >
        Update
      </button>
    </div>
  );
}

export default ComponentEditingPane;
