import classNames from "classnames";
import React, { useEffect, useState } from "react";
import TimerProgressBar from "../TimerProgressBar/TimerProgressBar";
import { getJSONFromStream } from "@/util/transfers";
import { SERVER_URL } from "@/util/constants";
import { type Tag, WithContext as ReactTags } from "react-tag-input";
import { ProjectWithFiles } from "@/util/storage";
import { ComponentCreationCallback } from "../ProjectEditor/editor-types";
import Button from "../Button/Button";
import { sanitizeComponentName } from "@/util/util";
import { toast } from "react-hot-toast";
import { analytics } from "@/util/analytics";

export interface ComponentCreationPaneProps {
  initialName: string | false;
  onCreated: ComponentCreationCallback;
  project: ProjectWithFiles;
}

function ComponentCreationPane({
  initialName,
  onCreated,
  project,
}: ComponentCreationPaneProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [desiredProps, setDesiredProps] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialName) {
      setName(sanitizeComponentName(initialName));
    }
  }, [initialName]);

  async function createProject() {
    setLoading(true);
    const requestBody = {
      name,
      description,
      props: desiredProps.map((p) => p.text),
    };
    analytics.track("Component Creation Requested", {
      ...requestBody,
      projectId: project.id,
    });
    const res = await fetch(`${SERVER_URL}/api/projects/${project.id}/files`, {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const json = await getJSONFromStream(res);
    setLoading(false);
    console.log(json);
    if (json.status === "error") {
      toast.error("Component generation failed -- Please try again!", {
        position: "top-center",
      });
      return;
    }
    onCreated(
      name,
      desiredProps.map((p) => p.text)
    );
  }

  function handleAddDesiredProp(prop: Tag) {
    setDesiredProps([
      ...desiredProps,
      { ...prop, text: prop.text.charAt(0).toLowerCase() + prop.text.slice(1) },
    ]);
  }

  function handleDeleteDesiredProp(i: number) {
    setDesiredProps(desiredProps.filter((_, index) => index !== i));
  }

  return (
    <div className="pb-4">
      <div className="pb-4 text-slate-500 italic">
        Describe a component and the LLM will generate it for you!
      </div>
      <input
        className={classNames(
          "transition-all w-full bg-slate-200 shadow-inner text-slate-900 rounded-lg p-3 mb-4 disabled:opacity-20"
        )}
        value={name}
        disabled={loading}
        placeholder="Component Name"
        onChange={(e) => setName(sanitizeComponentName(e.target.value))}
      />
      <ReactTags
        tags={desiredProps}
        delimiters={[188, 13, 32]}
        handleAddition={handleAddDesiredProp}
        handleDelete={handleDeleteDesiredProp}
        placeholder="Desired Props..."
        allowDragDrop={false}
        classNames={{
          tagInputField: `w-full bg-slate-200 shadow-inner text-slate-900 rounded-lg p-3 font-monospace mt-4 font-mono`,
          tags: loading ? "opacity-20" : "",
          tag: "bg-slate-900 p-2 text-slate-200 rounded-md font-mono mr-2",
          remove: "px-1",
        }}
        inputFieldPosition="bottom"
      />
      <textarea
        className={classNames(
          "transition-all w-full bg-slate-200 shadow-inner text-slate-900 rounded-lg p-3 mt-4 disabled:opacity-20",
          {}
        )}
        value={description}
        disabled={loading}
        placeholder="Describe the component..."
        onChange={(e) => setDescription(e.target.value)}
      />
      {loading && (
        <div className="py-4">
          <TimerProgressBar
            duration={30}
            caption="Your component is being generated..."
          />
        </div>
      )}
      <Button
        className="w-full mt-4"
        onClick={createProject}
        disabled={loading}
      >
        Generate!
      </Button>
    </div>
  );
}

export default ComponentCreationPane;
