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
import { queryProjectDb } from "@/util/util";
import { Theme } from "@/util/theming";

const importMapper = new ImportMapper({
  "@lightrail/react": ImportMapper.forceDefault(React),
  "@lightrail/ComponentPreviewWrapper": ImportMapper.forceDefault(
    ComponentPreviewWrapper
  ),
  "@lightrail/queryProjectDb": ImportMapper.forceDefault(queryProjectDb),
});

importMapper.register();

export interface PreviewRendererProps {
  project?: ProjectWithFiles;
  theme?: Theme;
  renderCount: number;
  noOverlay?: boolean;
  onOpenComponentList?: () => void;
  onRenderComplete?: () => void;
  ready?: boolean;
}

export default function PreviewRenderer({
  project,
  theme,
  renderCount,
  noOverlay,
  onOpenComponentList,
  onRenderComplete,
  ready,
}: PreviewRendererProps) {
  const setHoveringComponent = useSetRecoilState(hoveringComponent);
  const [rootComponent, setRootComponent] =
    useState<React.ComponentType | null>(null);
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null);

  let rootUrl: string | undefined;
  if (project && project.id) {
    rootUrl = `${SERVER_URL}/api/projects/${project.id}/files/index?r=${renderCount}`;
  } else if (theme) {
    const themeQueryString = new URLSearchParams(
      theme as Record<string, string>
    ).toString();
    rootUrl = `${SERVER_URL}/api/projects/themes/files/index?r=${renderCount}&${themeQueryString}`;
  }

  useEffect(() => {
    if (wrapper) {
      onRenderComplete?.();
    }
  }, [wrapper]);

  useEffect(() => {
    if (rootUrl) {
      setRootComponent(
        React.lazy(() =>
          import(/* webpackIgnore: true */ rootUrl!).catch((e) =>
            console.log(e)
          )
        )
      );
    }
  }, [rootUrl]);

  const ErrorFallbackComponent = useMemo(
    () =>
      ({ error }: { error: Error }) => {
        useEffect(() => {
          onOpenComponentList?.();
        }, [error]);

        return (
          <div
            ref={setWrapper}
            title={error.message}
            className="h-full text-red-500 bg-red-500 bg-opacity-10 border-red-500 border-4 border-opacity-40 p-2 "
          >
            Your page failed to render with the following error:
            <div className="font-mono font-semibold p-2">{error.message}</div>
            Click components in the panel to the right to view code & debug.
          </div>
        );
      },
    []
  );

  if (!rootComponent) {
    return null;
  }

  const Component = rootComponent;

  return (
    <ErrorBoundary FallbackComponent={ErrorFallbackComponent}>
      <div onMouseLeave={() => setHoveringComponent(null)} ref={setWrapper}>
        {ready && <Component />}
        {!noOverlay && <PreviewOverlayLayer />}
      </div>
    </ErrorBoundary>
  );
}
