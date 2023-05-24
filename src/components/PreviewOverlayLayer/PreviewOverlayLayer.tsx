import React, { useState } from "react";
import { useRecoilValue } from "recoil";
import {
  editingPopoverTarget,
  hoveringComponent,
  namePopoverTarget,
} from "../PreviewRenderer/preview-renderer-state";
import { Tooltip } from "react-tooltip";
import { Project } from "@/util/storage";
import ComponentEditingPane from "../ComponentEditingPane/ComponentEditingPane";
import NamePopover from "../NamePopover/NamePopover";
import EditingPopover from "../EditingPopover/EditingPopover";

export interface PreviewOverlayLayerProps {
  project: Project;
  onUpdate: (newContent: string) => void;
  onMessage: (message: string) => void;
}

function PreviewOverlayLayer({
  project,
  onUpdate,
  onMessage,
}: PreviewOverlayLayerProps) {
  const hoveringComponentValue = useRecoilValue(hoveringComponent);

  return (
    <>
      {hoveringComponentValue &&
        hoveringComponentValue.rects.map((rect, i) => (
          <div
            className="absolute bg-sky-300 border-sky-600 border-2 rounded-sm opacity-50 cursor-pointer pointer-events-none"
            key={i}
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            }}
          />
        ))}
      <EditingPopover
        project={project}
        onUpdate={onUpdate}
        onMessage={onMessage}
      />
      <NamePopover />
    </>
  );
}

export default PreviewOverlayLayer;
