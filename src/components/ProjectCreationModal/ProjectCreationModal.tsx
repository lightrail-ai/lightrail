import React from "react";
import Modal from "../Modal/Modal";
import ProjectCreationPane from "../ProjectCreationPane/ProjectCreationPane";

export interface ProjectCreationModalProps {
  visible: boolean;
}

function ProjectCreationModal({ visible }: ProjectCreationModalProps) {
  return (
    <Modal
      visible={visible}
      content={
        <>
          <ProjectCreationPane />
        </>
      }
    />
  );
}

export default ProjectCreationModal;
