"use client";

import { SERVER_URL } from "@/util/constants";
import { ProjectWithFiles } from "@/util/storage";
import React, { useEffect, useState } from "react";
import EditorNavbar from "../EditorNavbar/EditorNavbar";
import toast, { Toaster } from "react-hot-toast";

import "react-reflex/styles.css";
import { useRecoilState } from "recoil";
import { errorsQueue } from "../PreviewRenderer/preview-renderer-state";
import TourModal from "../TourModal/TourModal";
import { getJSONFromStream } from "@/util/transfers";
import PreviewFrame from "../PreviewFrame/PreviewFrame";
import ComponentCreationModal from "../ComponentCreationModal/ComponentCreationModal";
import { ComponentCreationCallback } from "./editor-types";
import LoadingSplashOverlay from "../LoadingSplashOverlay/LoadingSplashOverlay";
import ProjectInterfaceEditor from "../ProjectInterfaceEditor/ProjectInterfaceEditor";
import ProjectDataEditor from "../ProjectDataEditor/ProjectDataEditor";

export interface ProjectEditorProps {
  projectId: string;
}

async function getProject(projectId: string) {
  const res = await fetch(`${SERVER_URL}/api/projects/${projectId}`);
  return res.json();
}

const toastMessage = (message: string) =>
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-slate-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-slate-50 ring-opacity-50`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5 bg-slate-200 rounded-md">
              <img
                className="h-10 w-10 rounded-full"
                src="/assistant.png"
                alt=""
              />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-slate-50">Assistant</p>
              <p className="mt-1 text-sm text-slate-100">{message}</p>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      duration: 5000,
      position: "bottom-right",
    }
  );

function ProjectEditor({ projectId }: ProjectEditorProps) {
  const [project, setProject] = useState<ProjectWithFiles | undefined>();
  const [preparingFrame, setPreparingFrame] = useState(true);
  const [renderCount, setRenderCount] = useState(0);
  const [rendering, setRendering] = useState(false);
  const [errorsQueueValue, setErrorsQueue] = useRecoilState(errorsQueue);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isShowingComponentList, setIsShowingComponentList] = useState(false);
  const [creatingComponent, setCreatingComponent] = useState<string | false>(
    false
  );
  const [onComponentCreated, setOnComponentCreated] = useState<
    ComponentCreationCallback | undefined
  >(undefined);
  const [editorType, setEditorType] = useState<string>("interface");

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
          renderCount={0}
          setIsShowingComponentList={setIsShowingComponentList}
          isShowingComponentList={isShowingComponentList}
          setPreparingFrame={setPreparingFrame}
          setCreatingComponent={setCreatingComponent}
          setOnComponentCreated={setOnComponentCreated}
          onProjectRefresh={refreshProject}
          onUpdate={onUpdate}
          onMessage={toastMessage}
        />
      );
    }

    if (editorType === "data") {
      return <ProjectDataEditor project={project} />;
    }
  }

  useEffect(() => {
    if (errorsQueueValue.length > 0) {
      setErrorsQueue((errorsQueueValue) => {
        const err = errorsQueueValue[0];
        fetch(
          `${SERVER_URL}/api/projects/${projectId}/files/${err.component}/contents`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              error: err.error,
            }),
          }
        )
          .then((r) => getJSONFromStream(r))
          .then((r) => {
            if (r.status === "ok") {
              toastMessage(`Healed '${err.component}': ` + r.message);
              onUpdate();
            }
          });
        return errorsQueueValue.slice(1);
      });
    }
  }, [errorsQueueValue]);

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
        <ComponentCreationModal
          componentName={creatingComponent}
          setComponentName={setCreatingComponent}
          project={project}
          onComponentCreated={onComponentCreated}
        />
      )}
      <TourModal />
    </>
  );
}

export default ProjectEditor;
