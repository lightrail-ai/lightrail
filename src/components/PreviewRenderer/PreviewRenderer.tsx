"use client";

import { SERVER_URL } from "@/util/constants";
import React, { useEffect, useMemo, useState } from "react";
// @ts-ignore
import { ImportMapper } from "import-mapper";
import ComponentPreviewWrapper from "../ComponentPreviewWrapper";
import { useSetRecoilState } from "recoil";
import PreviewOverlayLayer from "../PreviewOverlayLayer/PreviewOverlayLayer";
import { hoveringComponent } from "./preview-renderer-state";
import { ProjectWithFiles } from "@/util/storage";
import { ErrorBoundary } from "react-error-boundary";

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
  onOpenComponentList?: () => void;
}

export default function PreviewRenderer({
  project,
  renderCount,
  offset,
  noOverlay,
  onOpenComponentList,
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

  const ErrorFallbackComponent = useMemo(
    () =>
      ({ error }: { error: Error }) => {
        useEffect(() => {
          onOpenComponentList?.();
        }, [error]);

        return (
          <div
            title={error.message}
            className="h-full text-red-500 bg-red-500 bg-opacity-10 border-red-500 border-4 border-opacity-40 p-2 "
          >
            Your page failed to render with the following error:
            <div className="font-mono font-semibold p-2">{error.message}</div>
            Click components in the panel to the right to view code & debug.
          </div>
        );
      },
    [name]
  );

  if (!rootComponent) {
    return null;
  }

  const Component = rootComponent;

  return (
    <ErrorBoundary FallbackComponent={ErrorFallbackComponent}>
      <div onMouseLeave={() => setHoveringComponent(null)}>
        {!noOverlay && <PreviewOverlayLayer offset={offset} />}
        <Component />
      </div>
    </ErrorBoundary>
  );
}
