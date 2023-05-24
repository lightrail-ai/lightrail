import React, { useRef } from "react";
import { useSetRecoilState } from "recoil";
import {
  editingComponent,
  editingPopoverTarget,
  hoveringComponent,
  namePopoverTarget,
} from "../PreviewRenderer/preview-renderer-state";

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
    <div
      className="contents cursor-pointer"
      ref={elementRef}
      onMouseOver={(e) => {
        if (!elementRef.current) return;
        let rects: DOMRect[] = [];
        Array.from(elementRef.current.children).forEach((node) => {
          rects = rects.concat(Array.from(node.getClientRects()));
        });
        setHoveringComponent({
          name,
          rects,
        });
        setNamePopoverTarget(e.target as HTMLElement);
        e.stopPropagation();
        e.preventDefault();
      }}
      onClick={(e) => {
        setNamePopoverTarget(null);
        setEditingComponent({ name });
        setEditingPopoverTarget(e.target as HTMLElement);
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {children}
    </div>
  );
}

export default ComponentPreviewWrapper;
