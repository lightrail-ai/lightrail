import { FileStateItem, ProjectWithFiles } from "@/util/storage";
import React from "react";
import { useRecoilValue } from "recoil";
import { editingComponent } from "../PreviewRenderer/preview-renderer-state";
import { ReflexElement } from "react-reflex";
import VariableToken from "../VariableToken/VariableToken";

export interface ComponentInfoPanelProps {
  project: ProjectWithFiles;
}

function ComponentInfoPanel({ project }: ComponentInfoPanelProps) {
  const editingComponentValue = useRecoilValue(editingComponent);
  const editingComponentFile = project.files.find(
    (f) => f.path === editingComponentValue?.name
  );

  const state = editingComponentFile?.state as unknown as FileStateItem[];
  const props = Array.from(
    new Set(
      Array.from(
        editingComponentFile?.contents?.matchAll(/props\.(\w+)/g) || []
      ).map((m) => m[1])
    ).values()
  );

  const isOpen = !!(state?.length || props?.length);

  console.log(isOpen);

  return (
    <ReflexElement flex={isOpen ? 0.5 : 0}>
      <div className="flex flex-col min-h-full bg-slate-50 text-slate-800 px-4 py-2">
        <div className="text-sm font-semibold">State</div>
        <div className="space-y-2 my-4">
          {state?.map((s) => (
            <VariableToken
              name={s.name}
              subName={
                "set" + s.name.charAt(0).toUpperCase() + s.name.substring(1)
              }
              value={JSON.stringify(s.initial)}
            />
          ))}
        </div>
        <div className="text-sm font-semibold">Props</div>
        <div className="space-y-2 my-4">
          {props?.map((s) => (
            <VariableToken name={s} />
          ))}
        </div>
      </div>
    </ReflexElement>
  );
}

export default ComponentInfoPanel;
