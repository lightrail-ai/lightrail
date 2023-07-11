import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  editingComponent,
  hoveringComponent,
} from "../PreviewRenderer/preview-renderer-state";
import { ErrorBoundary } from "react-error-boundary";
import {
  autoPlacement,
  safePolygon,
  shift,
  useFloating,
  useHover,
  useInteractions,
} from "@floating-ui/react";
import ErrorTooltip from "../ErrorTooltip/ErrorTooltip";
import { analytics } from "@/util/analytics";

export interface ComponentPreviewWrapperProps {
  children: React.ReactNode;
  name: string;
}

function ComponentPreviewWrapper({
  children,
  name,
}: ComponentPreviewWrapperProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const setHoveringComponent = useSetRecoilState(hoveringComponent);
  const setEditingComponent = useSetRecoilState(editingComponent);

  const ErrorFallbackComponent = useMemo(
    () =>
      ({ error }: { error: Error }) => {
        useEffect(() => {
          analytics.track("Component Error", {
            component: name,
            error: error.message,
          });
        }, [error]);

        /* Hover state management */
        const [isOpen, setIsOpen] = useState(false);
        const [isWorking, setIsWorking] = useState(false);
        const { refs, floatingStyles, context } = useFloating({
          middleware: [autoPlacement(), shift()],
          placement: "bottom-start",
          open: isOpen || isWorking,
          onOpenChange: setIsOpen,
        });
        const hover = useHover(context, {
          handleClose: safePolygon(),
        });
        const { getReferenceProps, getFloatingProps } = useInteractions([
          hover,
        ]);

        return (
          <span
            ref={refs.setReference}
            {...getReferenceProps()}
            className="inline-block text-red-500 bg-red-500 bg-opacity-10 border-red-500 border border-opacity-40 p-2 text-center hover:bg-opacity-100 hover:text-white transition-colors duration-200"
          >
            <b>{name}</b> failed to render
            <div className="text-xs text-center">Hover for more info</div>
            {(isOpen || isWorking) && (
              <div
                ref={refs.setFloating}
                style={floatingStyles}
                {...getFloatingProps()}
                className="max-w-[90vw] box-border error-tooltip"
              >
                <ErrorTooltip
                  error={error}
                  componentName={name}
                  onLoadingStateChange={setIsWorking}
                />
              </div>
            )}
          </span>
        );
      },
    [name]
  );

  return (
    <div
      className="contents cursor-pointer component-preview-wrapper"
      ref={elementRef}
      onMouseOver={(e) => {
        if (!elementRef.current) return;
        let rects: DOMRect[] = [];
        const children = Array.from(elementRef.current.children);
        children.forEach((node) => {
          rects = rects.concat(Array.from(node.getClientRects()));
        });
        setHoveringComponent({
          name,
          rects,
        });
        e.stopPropagation();
        e.preventDefault();
      }}
      onClick={(e) => {
        if (!elementRef.current) return;
        setEditingComponent({ name });
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <ErrorBoundary FallbackComponent={ErrorFallbackComponent}>
        {children}
      </ErrorBoundary>
    </div>
  );
}

export default ComponentPreviewWrapper;
