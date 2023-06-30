"use client";

import { SERVER_URL } from "@/util/constants";
import { ProjectWithFiles } from "@/util/storage";
import React, { useEffect, useState } from "react";
import EditorNavbar from "../EditorNavbar/EditorNavbar";
import toast, { Toaster } from "react-hot-toast";

import "react-reflex/styles.css";
import TourModal from "../TourModal/TourModal";
import PreviewFrame from "../PreviewFrame/PreviewFrame";
import ComponentCreationModal from "../ComponentCreationModal/ComponentCreationModal";
import { ComponentCreationCallback } from "./editor-types";
import LoadingSplashOverlay from "../LoadingSplashOverlay/LoadingSplashOverlay";
import ProjectInterfaceEditor from "../ProjectInterfaceEditor/ProjectInterfaceEditor";
import ProjectDataEditor from "../ProjectDataEditor/ProjectDataEditor";
import { type UpdateProposal } from "../UpdateProposalModal";
import UpdateProposalModal from "../UpdateProposalModal/UpdateProposalModal";
import { useRecoilState } from "recoil";
import { activeProject, activeProposal } from "./editor-state";

export interface ProjectEditorProps {
  projectId: string;
}

async function getProject(projectId: string) {
  const res = await fetch(`${SERVER_URL}/api/projects/${projectId}`);
  return res.json();
}

function ProjectEditor({ projectId }: ProjectEditorProps) {
  const [project, setProject] = useRecoilState(activeProject);
  const [preparingFrame, setPreparingFrame] = useState(true);
  const [renderCount, setRenderCount] = useState(0);
  const [rendering, setRendering] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isShowingComponentList, setIsShowingComponentList] = useState(false);
  const [creatingComponent, setCreatingComponent] = useState<string | false>(
    false
  );
  const [onComponentCreated, setOnComponentCreated] = useState<
    ComponentCreationCallback | undefined
  >(undefined);
  const [editorType, setEditorType] = useState<string>("interface");
  const [proposal, setProposal] = useRecoilState(activeProposal);

  function updateRenderCount() {
    setRenderCount(Date.now());
  }

  useEffect(() => {
    setPreparingFrame(true);
    updateRenderCount();
    getProject(projectId).then((p) => setProject(p.project));
  }, [projectId]);

  async function refreshProject() {
    const p = await getProject(projectId);
    setProject(p.project);
  }

  async function onUpdate() {
    setRendering(true);
    updateRenderCount();
    await refreshProject();
    setRendering(false);
  }

  function renderMainView() {
    if (!project) {
      return <></>;
    }

    if (isPreviewing) {
      return (
        <div className="flex-1">
          <PreviewFrame
            project={project}
            renderCount={renderCount}
            onRenderComplete={() => setPreparingFrame(false)}
            noOverlay
          />
        </div>
      );
    }

    if (editorType === "interface") {
      return (
        <ProjectInterfaceEditor
          project={project}
          rendering={rendering}
          renderCount={renderCount}
          setIsShowingComponentList={setIsShowingComponentList}
          isShowingComponentList={isShowingComponentList}
          setPreparingFrame={setPreparingFrame}
          setCreatingComponent={setCreatingComponent}
          setOnComponentCreated={setOnComponentCreated}
          onProjectRefresh={refreshProject}
          onUpdate={onUpdate}
          onProposal={(p) => setProposal(p)}
        />
      );
    }

    if (editorType === "data") {
      return <ProjectDataEditor project={project} />;
    }
  }

  return (
    <>
      {(!project || preparingFrame) && (
        <LoadingSplashOverlay message={"Loading Project..."} />
      )}
      <div
        className="h-screen w-screen flex flex-col max-h-screen"
        style={{
          backgroundColor: "#fff",
          backgroundImage:
            "linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        }}
      >
        <EditorNavbar
          project={project}
          editorType={editorType}
          onEditorTypeChange={(newType) => setEditorType(newType)}
          isPreviewing={isPreviewing}
          onTogglePreview={() => setIsPreviewing(!isPreviewing)}
          isShowingComponentList={isShowingComponentList}
          onToggleComponentList={() =>
            setIsShowingComponentList(!isShowingComponentList)
          }
        />
        {renderMainView()}
      </div>
      <Toaster />
      {project && (
        <>
          <ComponentCreationModal
            componentName={creatingComponent}
            setComponentName={setCreatingComponent}
            project={project}
            onComponentCreated={onComponentCreated}
          />
          <UpdateProposalModal
            proposal={proposal}
            onChangeProposal={setProposal}
            onAccepted={onUpdate}
            project={project}
          />
        </>
      )}
      <TourModal />
    </>
  );
}

export default ProjectEditor;
