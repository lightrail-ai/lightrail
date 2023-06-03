import React from "react";
import Modal from "../Modal/Modal";
import ProjectCreationPane from "../ProjectCreationPane/ProjectCreationPane";

export interface ProjectCreationModalProps {
  visible: boolean;
  onClose: () => void;
}

function ProjectCreationModal({ visible, onClose }: ProjectCreationModalProps) {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="New Project"
      content={
        <>
          <ProjectCreationPane />
        </>
      }
    />
  );
}

export default ProjectCreationModal;
