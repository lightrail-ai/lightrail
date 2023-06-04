"use client";

import { SERVER_URL } from "@/util/constants";
import React, { useEffect, useState } from "react";
// @ts-ignore
import { ImportMapper } from "import-mapper";
import ComponentPreviewWrapper from "../ComponentPreviewWrapper";
import { useSetRecoilState } from "recoil";
import PreviewOverlayLayer from "../PreviewOverlayLayer/PreviewOverlayLayer";
import { hoveringComponent } from "./preview-renderer-state";
import { ProjectWithFiles } from "@/util/storage";

import "./preview-styling.css";

const importMapper = new ImportMapper({
  "@lightwand/react": ImportMapper.forceDefault(React),
  "@lightwand/ComponentPreviewWrapper": ImportMapper.forceDefault(
    ComponentPreviewWrapper
  ),
});

importMapper.register();

export interface PreviewRendererProps {
  project: ProjectWithFiles;
  renderCount: number;
  offset: [number, number];
  noOverlay?: boolean;
}

export default function PreviewRenderer({
  project,
  renderCount,
  offset,
  noOverlay,
}: PreviewRendererProps) {
  const setHoveringComponent = useSetRecoilState(hoveringComponent);
  const [rootComponent, setRootComponent] =
    useState<React.ComponentType | null>(null);

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
      {!noOverlay && <PreviewOverlayLayer offset={offset} />}
      <Component />
    </div>
  );
}
