import { SERVER_URL } from "@/util/constants";
import classNames from "classnames";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import TimerProgressBar from "../TimerProgressBar/TimerProgressBar";
import { getJSONFromStream } from "@/util/transfers";
import Select from "../Select/Select";
import { LibraryCategories } from "@/util/starter-library";
import Explanation from "../Explanation/Explanation";
import { type Tag, WithContext as ReactTags } from "react-tag-input";
import Button from "../Button/Button";
import { sanitizeComponentName } from "@/util/util";
import { toast } from "react-hot-toast";
import { analytics } from "@/util/analytics";

export interface ProjectCreationPaneProps {}

function ProjectCreationPane({}: ProjectCreationPaneProps) {
  const [name, setName] = useState("");
  const [componentName, setComponentName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"webpage" | "component">("webpage");
  const [category, setCategory] = useState<string>("none");
  const [desiredProps, setDesiredProps] = useState<Tag[]>([]);
  const router = useRouter();

  function handleAddDesiredProp(prop: Tag) {
    setDesiredProps([
      ...desiredProps,
      { ...prop, text: prop.text.charAt(0).toLowerCase() + prop.text.slice(1) },
    ]);
  }

  function handleDeleteDesiredProp(i: number) {
    setDesiredProps(desiredProps.filter((_, index) => index !== i));
  }

  async function createProject() {
    setLoading(true);

    const requestBody = {
      name: type === "component" ? componentName : name,
      description,
      type,
      libraries: category === "none" ? [] : [category],
      props: desiredProps.map((p) => p.text),
    };

    analytics.track("Project Creation Requested", requestBody);

    const res = await fetch(`${SERVER_URL}/api/projects`, {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const json = await getJSONFromStream(res);
    setLoading(false);

    if (json.status === "error") {
      console.log(json);
      toast.error("Project generation failed -- Please try again!", {
        position: "top-center",
      });
      return;
    }

    router.push("/projects/" + json.id);
  }

  return (
    <div className="pb-4">
      {type === "component" ? (
        <input
          className={classNames(
            "transition-all w-full bg-slate-200 shadow-inner text-slate-900 rounded-lg p-3 mt-0.5 mb-4 disabled:opacity-20"
          )}
          value={componentName}
          disabled={loading}
          placeholder={`Component Name`}
          onChange={(e) => {
            setComponentName(sanitizeComponentName(e.target.value));
          }}
        />
      ) : (
        <input
          className={classNames(
            "transition-all w-full bg-slate-200 shadow-inner text-slate-900 rounded-lg p-3 mt-0.5 mb-4 disabled:opacity-20"
          )}
          value={name}
          disabled={loading}
          placeholder={`Project Name`}
          onChange={(e) => {
            setName(e.target.value);
            setComponentName(sanitizeComponentName(e.target.value));
          }}
        />
      )}
      <div className="pb-4">
        <div
          onClick={() => setType("webpage")}
          className={classNames(
            "w-1/2 inline-block text-center py-4 rounded-l-lg font-semibold",
            {
              "shadow-inner bg-slate-300 text-slate-600": type === "webpage",
              "shadow-md bg-slate-100 border hover:opacity-80 cursor-pointer ":
                type !== "webpage",
            }
          )}
        >
          Webpage
        </div>
        <div
          onClick={() => setType("component")}
          className={classNames(
            "w-1/2 inline-block text-center py-4 rounded-r-lg font-semibold",
            {
              "shadow-inner bg-slate-300 text-slate-600": type === "component",
              "shadow-sm bg-slate-100 border hover:opacity-80 cursor-pointer ":
                type !== "component",
            }
          )}
        >
          Component
        </div>
      </div>
      {type === "webpage" && (
        <>
          <label className="block mb-1 text-sm font-semibold text-gray-900 dark:text-white">
            Component Library{" "}
            <Explanation
              text={
                "Choosing an appropriate component library will make a number of pre-built components available to the project generation model. This often results in more visually appealing projects, but can also decrease variety."
              }
            />
          </label>
          <Select
            options={LibraryCategories}
            value={category}
            onChange={setCategory}
          />
        </>
      )}
      {type === "component" && (
        <>
          <label className="block mb-1 text-sm font-semibold text-gray-900 dark:text-white">
            Desired Props
          </label>
          <ReactTags
            tags={desiredProps}
            delimiters={[188, 13, 32]}
            handleAddition={handleAddDesiredProp}
            handleDelete={handleDeleteDesiredProp}
            placeholder="Desired Props (Press Enter/Return to Add)..."
            allowDragDrop={false}
            classNames={{
              tagInputField: `w-full bg-slate-200 shadow-inner text-slate-900 rounded-lg p-3 ${
                desiredProps.length > 0 && "mt-4"
              } mb-4`,
              tags: `${loading ? "opacity-20" : ""} ${
                desiredProps.length > 0 && "mt-2"
              }`,
              tag: "bg-slate-900 p-2 text-slate-200 rounded-md mr-2",
              remove: "px-1",
            }}
            inputFieldPosition="bottom"
          />
        </>
      )}
      <label className="block mb-1 text-sm font-semibold text-gray-900 dark:text-white">
        Description
      </label>
      <textarea
        className={classNames(
          "transition-all w-full bg-slate-200 shadow-inner text-slate-900 rounded-lg p-3 disabled:opacity-20",
          {}
        )}
        value={description}
        disabled={loading}
        placeholder={`Describe the ${type} you'd like to create!`}
        onChange={(e) => setDescription(e.target.value)}
      />
      {loading && (
        <div className="py-4">
          <TimerProgressBar
            duration={240}
            caption="Please be patient as your project is generated, it can take several minutes."
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

export default ProjectCreationPane;
