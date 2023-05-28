import classNames from "classnames";
import React, { useState } from "react";

export interface ProjectCreationPaneProps {}

function ProjectCreationPane({}: ProjectCreationPaneProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  return (
    <div className="p-4">
      <div className="font-semibold text-2xl pb-4">New Project</div>
      <div className="pb-4 text-slate-500 italic">
        Describe a webpage or component, and an LLM will generate components
        that fit your description.{" "}
      </div>
      <input
        className={classNames(
          "transition-all w-full bg-slate-200 shadow-inner text-slate-900 rounded-lg p-3 mb-4"
        )}
        value={name}
        placeholder="Project Name"
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        className={classNames(
          "transition-all w-full bg-slate-200 shadow-inner text-slate-900 rounded-lg p-3",
          {}
        )}
        value={description}
        placeholder="Describe what you'd like to create!"
        onChange={(e) => setDescription(e.target.value)}
      />
      <button className="w-full bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-300 shadow-md p-2 rounded-lg disabled:opacity-20 font-semibold mt-4">
        Generate!
      </button>
    </div>
  );
}

export default ProjectCreationPane;
