"use client";

import { SERVER_URL } from "@/util/constants";
import React, { ReactElement, useEffect, useRef, useState } from "react";
// @ts-ignore
import { ImportMapper } from "import-mapper";
import ComponentPreviewWrapper from "../ComponentPreviewWrapper";
import { RecoilRoot, useSetRecoilState } from "recoil";
import PreviewOverlayLayer from "../PreviewOverlayLayer/PreviewOverlayLayer";
import { hoveringComponent } from "./preview-renderer-state";
import { Project, ProjectWithFiles } from "@/util/storage";

const importMapper = new ImportMapper({
  "@halloumi/react": ImportMapper.forceDefault(React),
  "@halloumi/ComponentPreviewWrapper": ImportMapper.forceDefault(
    ComponentPreviewWrapper
  ),
});

importMapper.register();

export interface PreviewRendererProps {
  project: ProjectWithFiles;
  onUpdate: () => void;
  onMessage: (message: string) => void;
  offset: [number, number];
}

function PreviewRenderer({
  project,
  onUpdate,
  onMessage,
  offset,
}: PreviewRendererProps) {
  const setHoveringComponent = useSetRecoilState(hoveringComponent);
  const [rootComponent, setRootComponent] =
    useState<React.ComponentType | null>(null);
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    if (!project || !project.id) return;

    setRootComponent(
      React.lazy(() =>
        import(
          /* webpackIgnore: true */ `${SERVER_URL}/api/projects/${project.id}/files/index?r=${renderCount}`
        ).catch((e) => console.log(e))
      )
    );
  }, [project, renderCount]);

  if (!rootComponent) {
    return null;
  }

  const Component = rootComponent;

  return (
    <div onMouseLeave={() => setHoveringComponent(null)}>
      <PreviewOverlayLayer
        offset={offset}
        project={project}
        onUpdate={() => {
          setRenderCount(renderCount + 1);
          onUpdate();
        }}
        onMessage={onMessage}
      />
      <Component />
    </div>
  );
}

export default function RecoiledPreviewRenderer(props: PreviewRendererProps) {
  return (
    <RecoilRoot>
      <PreviewRenderer {...props} />
    </RecoilRoot>
  );
}
