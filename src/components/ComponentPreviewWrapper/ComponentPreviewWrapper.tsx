import React, { useEffect, useMemo, useRef } from "react";
import { useSetRecoilState } from "recoil";
import {
  editingComponent,
  editingPopoverTarget,
  hoveringComponent,
  namePopoverTarget,
} from "../PreviewRenderer/preview-renderer-state";
import { ErrorBoundary } from "react-error-boundary";

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
  const setNamePopoverTarget = useSetRecoilState(namePopoverTarget);
  const setEditingComponent = useSetRecoilState(editingComponent);
  const setEditingPopoverTarget = useSetRecoilState(editingPopoverTarget);

  const ErrorFallbackComponent = useMemo(
    () =>
      ({ error }: { error: Error }) => {
        useEffect(() => {
          // TODO: Try to heal ONCE but then stop.
          // setErrorsQueue((prev) =>
          //   prev.find((e) => e.component === name)
          //     ? prev
          //     : [
          //         ...prev,
          //         {
          //           component: name,
          //           error: error.message,
          //         },
          //       ]
          // );
        }, [error]);

        return (
          <span
            title={error.message}
            className="inline-block text-red-500 bg-red-500 bg-opacity-10 border-red-500 border border-opacity-40 p-2 "
          >
            <b>{name}</b> failed to render, please inspect manually.
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
        setNamePopoverTarget(
          (children.length ? children[0] : e.target) as HTMLElement
        );
        e.stopPropagation();
        e.preventDefault();
      }}
      onClick={(e) => {
        if (!elementRef.current) return;
        setNamePopoverTarget(null);
        setEditingComponent({ name });
        const children = Array.from(elementRef.current.children);
        setEditingPopoverTarget(
          (children.length ? children[0] : e.target) as HTMLElement
        );
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
