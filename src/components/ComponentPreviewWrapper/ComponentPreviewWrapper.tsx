import React, { useRef } from "react";
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

  return (
    <ErrorBoundary fallback={<div>Error</div>}>
      <div
        className="contents cursor-pointer"
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
        {children}
      </div>
    </ErrorBoundary>
  );
}

export default ComponentPreviewWrapper;
