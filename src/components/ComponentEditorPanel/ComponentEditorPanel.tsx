import { ProjectWithFiles } from "@/util/storage";
import React from "react";
import { ReflexElement } from "react-reflex";
import ComponentEditingPane from "../ComponentEditingPane/ComponentEditingPane";
import { useRecoilValue } from "recoil";
import { editingPopoverTarget } from "../PreviewRenderer/preview-renderer-state";
import classNames from "classnames";
import { ComponentCreationCallback } from "../ProjectEditor/editor-types";

export interface ComponentEditorPanelProps {
  project: ProjectWithFiles | undefined;
  onUpdate: (newContent: string) => void;
  onMessage: (message: string) => void;
  onCreateComponent: (
    name: string,
    callback: ComponentCreationCallback
  ) => void;
}

function ComponentEditorPanel({
  project,
  onUpdate,
  onMessage,
  onCreateComponent,
}: ComponentEditorPanelProps) {
  const target = useRecoilValue(editingPopoverTarget);

  return (
    <ReflexElement
      className={classNames(
        "bg-slate-900 text-slate-200 flex flex-col min-h-0",
        {
          "p-4": target,
        }
      )}
      flex={target ? 2 : 0}
    >
      {project && (
        <ComponentEditingPane
          project={project}
          onUpdate={onUpdate}
          onMessage={onMessage}
          onCreateComponent={onCreateComponent}
        />
      )}
    </ReflexElement>
  );
}

export default ComponentEditorPanel;
