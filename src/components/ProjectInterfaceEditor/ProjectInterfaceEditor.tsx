import React from "react";
import BrowserMockup from "../BrowserMockup/BrowserMockup";

import { ReflexContainer, ReflexElement, ReflexSplitter } from "react-reflex";

import ComponentEditorPanel from "../ComponentEditorPanel/ComponentEditorPanel";

import classNames from "classnames";
import ComponentsListPanel from "../ComponentsListPanel/ComponentsListPanel";
import ComponentPreviewDressing from "../ComponentPreviewDressing/ComponentPreviewDressing";
import ComponentInfoPanel from "../ComponentInfoPanel/ComponentInfoPanel";
import { ProjectWithFiles } from "@/util/storage";
import { ComponentCreationCallback } from "../ProjectEditor/editor-types";
import PreviewFrame from "../PreviewFrame/PreviewFrame";

export interface ProjectInterfaceEditorProps {
  project: ProjectWithFiles;
  rendering: boolean;
  renderCount: number;
  setIsShowingComponentList: (isShowingComponentList: boolean) => void;
  isShowingComponentList: boolean;
  setPreparingFrame: (preparingFrame: boolean) => void;
  setCreatingComponent: (creatingComponent: string) => void;
  setOnComponentCreated: (
    onComponentCreated: ComponentCreationCallback
  ) => void;
  onProjectRefresh: () => void;
  onUpdate: () => void;
  onMessage: (message: string) => void;
}

function ProjectInterfaceEditor({
  project,
  rendering,
  renderCount,
  setIsShowingComponentList,
  isShowingComponentList,
  setPreparingFrame,
  setCreatingComponent,
  setOnComponentCreated,
  onProjectRefresh,
  onUpdate,
  onMessage,
}: ProjectInterfaceEditorProps) {
  return (
    <ReflexContainer orientation="horizontal">
      <ReflexElement flex={3}>
        <ReflexContainer orientation="vertical">
          {project && (
            <ComponentInfoPanel
              project={project}
              onProjectRefresh={onProjectRefresh}
              onUpdateComponentTree={onUpdate}
            />
          )}
          <ReflexSplitter />
          <ReflexElement
            className={classNames("flex flex-row min-h-0", {
              "opacity-50": rendering,
            })}
            flex={3}
          >
            {project?.type === "component" ? (
              <ComponentPreviewDressing>
                <PreviewFrame
                  transparent
                  project={project}
                  renderCount={renderCount}
                  onOpenComponentList={() => setIsShowingComponentList(true)}
                  onRenderComplete={() => setPreparingFrame(false)}
                />
              </ComponentPreviewDressing>
            ) : (
              <BrowserMockup>
                {project && (
                  <PreviewFrame
                    project={project}
                    renderCount={renderCount}
                    onOpenComponentList={() => setIsShowingComponentList(true)}
                    onRenderComplete={() => setPreparingFrame(false)}
                  />
                )}
              </BrowserMockup>
            )}
          </ReflexElement>
          <ReflexSplitter />
          {project && (
            <ComponentsListPanel
              project={project}
              isOpen={isShowingComponentList}
              onToggleOpen={() =>
                setIsShowingComponentList(!isShowingComponentList)
              }
              onCreateComponent={() => {
                setCreatingComponent("");
                setOnComponentCreated(() => onProjectRefresh);
              }}
            />
          )}
        </ReflexContainer>
      </ReflexElement>
      <ReflexSplitter />
      <ComponentEditorPanel
        project={project}
        onUpdate={onUpdate}
        onMessage={onMessage}
        onCreateComponent={(name, callback) => {
          setCreatingComponent(name);
          setOnComponentCreated(() => callback);
        }}
      />
    </ReflexContainer>
  );
}

export default ProjectInterfaceEditor;
