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
import ErrorTooltip from "../ErrorTooltip/ErrorTooltip";
import { analytics } from "@/util/analytics";

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
          analytics.track("Component Error", {
            component: "index",
            error: error.message,
          });
        }, [error]);

        return (
          <ErrorTooltip
            componentName="index"
            error={error}
            title={"Top-level component failed to render (details below)"}
          />
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
