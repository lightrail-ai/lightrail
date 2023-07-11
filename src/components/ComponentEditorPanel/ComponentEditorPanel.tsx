import { ProjectWithFiles } from "@/util/storage";
import React from "react";
import { ReflexElement } from "react-reflex";
import ComponentEditingPane from "../ComponentEditingPane/ComponentEditingPane";
import { useRecoilValue } from "recoil";
import { editingComponent } from "../PreviewRenderer/preview-renderer-state";
import classNames from "classnames";
import { ComponentCreationCallback } from "../ProjectEditor/editor-types";
import { type UpdateProposal } from "../UpdateProposalModal";

export interface ComponentEditorPanelProps {
  project: ProjectWithFiles | undefined;
  onUpdate: () => void;
  onProposal: (proposal: UpdateProposal) => void;
  onCreateComponent: (
    name: string,
    callback: ComponentCreationCallback
  ) => void;
}

function ComponentEditorPanel({
  project,
  onUpdate,
  onProposal,
  onCreateComponent,
}: ComponentEditorPanelProps) {
  const editingComponentValue = useRecoilValue(editingComponent);

  return (
    <ReflexElement
      className={classNames(
        "bg-slate-100 text-slate-800 flex flex-col min-h-0",
        {
          "p-4": editingComponentValue,
        }
      )}
      flex={editingComponentValue ? 2 : 0}
    >
      {project && (
        <ComponentEditingPane
          project={project}
          onUpdate={onUpdate}
          onProposal={onProposal}
          onCreateComponent={onCreateComponent}
        />
      )}
    </ReflexElement>
  );
}

export default ComponentEditorPanel;
