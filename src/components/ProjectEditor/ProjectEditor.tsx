"use client";

import { SERVER_URL } from "@/util/constants";
import { Project, ProjectWithFiles } from "@/util/storage";
import React, { useEffect, useState } from "react";
import PreviewRenderer from "../PreviewRenderer";
import EditorNavbar from "../EditorNavbar/EditorNavbar";
import BrowserMockup from "../BrowserMockup/BrowserMockup";
import toast, { Toaster } from "react-hot-toast";
import EditingPopover from "../EditingPopover/EditingPopover";

import "react-reflex/styles.css";
import { ReflexContainer, ReflexElement, ReflexSplitter } from "react-reflex";
import ComponentEditingPane from "../ComponentEditingPane/ComponentEditingPane";
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
import { configState } from "../ConfigControls/config-state";
import ComponentEditorPanel from "../ComponentEditorPanel/ComponentEditorPanel";
import classNames from "classnames";
import { errorsQueue } from "../PreviewRenderer/preview-renderer-state";
import ComponentsListPanel from "../ComponentsListPanel/ComponentsListPanel";

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
  const [previewOffset, setPreviewOffset] = useState<[number, number]>([0, 0]);
  const [renderCount, setRenderCount] = useState(0);
  const [rendering, setRendering] = useState(false);
  const config = useRecoilValue(configState);
  const [errorsQueueValue, setErrorsQueue] = useRecoilState(errorsQueue);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isShowingComponentList, setIsShowingComponentList] = useState(false);

  useEffect(() => {
    getProject(projectId).then((p) => setProject(p.project));
  }, [projectId]);

  async function onUpdate() {
    setRendering(true);
    setRenderCount(renderCount + 1);
    const p = await getProject(projectId);
    setProject(p.project);
    setRendering(false);
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
          .then((r) => r.json())
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
      <div
        className="h-screen w-screen flex flex-col max-h-screen"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #ccc 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      >
        <EditorNavbar
          project={project}
          isPreviewing={isPreviewing}
          onTogglePreview={() => setIsPreviewing(!isPreviewing)}
          isShowingComponentList={isShowingComponentList}
          onToggleComponentList={() =>
            setIsShowingComponentList(!isShowingComponentList)
          }
        />
        {isPreviewing ? (
          project && (
            <PreviewRenderer
              offset={previewOffset}
              project={project}
              renderCount={renderCount}
              noOverlay
            />
          )
        ) : (
          <ReflexContainer orientation="horizontal">
            <ReflexElement flex={3}>
              <ReflexContainer orientation="vertical">
                <ReflexElement
                  className={classNames("flex flex-row min-h-0", {
                    "opacity-50": rendering,
                  })}
                  flex={3}
                >
                  <BrowserMockup
                    onOffsetUpdate={(offset) => setPreviewOffset(offset)}
                  >
                    {project && (
                      <PreviewRenderer
                        offset={previewOffset}
                        project={project}
                        renderCount={renderCount}
                        onOpenComponentList={() =>
                          setIsShowingComponentList(true)
                        }
                      />
                    )}
                  </BrowserMockup>
                </ReflexElement>
                <ReflexSplitter />
                {project && (
                  <ComponentsListPanel
                    project={project}
                    isOpen={isShowingComponentList}
                    onToggleOpen={() =>
                      setIsShowingComponentList(!isShowingComponentList)
                    }
                  />
                )}
              </ReflexContainer>
            </ReflexElement>
            <ReflexSplitter />
            {config.editUX === "panel" && (
              <ComponentEditorPanel
                project={project}
                onUpdate={onUpdate}
                onMessage={(message) => toastMessage(message)}
              />
            )}
          </ReflexContainer>
        )}
      </div>
      <Toaster />
      {project && config.editUX === "popover" && (
        <EditingPopover
          project={project}
          onUpdate={onUpdate}
          onMessage={(message) => toastMessage(message)}
        />
      )}
    </>
  );
}

export default (props: ProjectEditorProps) => (
  <RecoilRoot>
    <ProjectEditor {...props} />
  </RecoilRoot>
);
