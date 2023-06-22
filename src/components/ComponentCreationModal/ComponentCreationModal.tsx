import React from "react";
import Modal from "../Modal/Modal";
import ComponentCreationPane from "../ComponentCreationPane/ComponentCreationPane";
import { ProjectWithFiles } from "@/util/storage";
import { ComponentCreationCallback } from "../ProjectEditor/editor-types";

export interface ComponentCreationModalProps {
  componentName: string | false;
  setComponentName: (name: string | false) => void;
  project: ProjectWithFiles;
  onComponentCreated?: ComponentCreationCallback;
}

function ComponentCreationModal({
  componentName,
  setComponentName,
  project,
  onComponentCreated,
}: ComponentCreationModalProps) {
  return (
    <Modal
      visible={componentName !== false}
      onClose={() => setComponentName(false)}
      title="New Component"
      content={
        <ComponentCreationPane
          initialName={componentName}
          onCreated={(...args) => {
            setComponentName(false);
            onComponentCreated?.(...args);
          }}
          project={project}
        />
      }
    />
  );
}

export default ComponentCreationModal;
