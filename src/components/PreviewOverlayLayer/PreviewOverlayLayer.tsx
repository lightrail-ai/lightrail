import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import {
  editingPopoverTarget,
  hoveringComponent,
  namePopoverTarget,
} from "../PreviewRenderer/preview-renderer-state";
import { Tooltip } from "react-tooltip";
import { Project, ProjectWithFiles } from "@/util/storage";
import ComponentEditingPane from "../ComponentEditingPane/ComponentEditingPane";
import NamePopover from "../NamePopover/NamePopover";
import EditingPopover from "../EditingPopover/EditingPopover";

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function OverlayDiv({
  offset,
  rect,
}: {
  offset: [number, number];
  rect: Rect;
}) {
  const [correctedRect, setCorrectedRect] = useState<Rect | null>();

  useEffect(() => {
    setCorrectedRect({
      top:
        rect.top +
        document.getElementById("browser-template__contents")!.scrollTop -
        offset[1],
      left:
        rect.left +
        document.getElementById("browser-template__contents")!.scrollLeft -
        offset[0],
      width: rect.width,
      height: rect.height,
    });
  }, [rect, offset]);

  if (!correctedRect) return null;

  return (
    <div
      className="absolute bg-sky-300 border-sky-600 border-2 rounded-sm opacity-50 cursor-pointer pointer-events-none"
      style={correctedRect}
    />
  );
}

export interface PreviewOverlayLayerProps {
  project: ProjectWithFiles;
  onUpdate: (newContent: string) => void;
  onMessage: (message: string) => void;
  offset: [number, number];
}

function PreviewOverlayLayer({
  project,
  onUpdate,
  onMessage,
  offset,
}: PreviewOverlayLayerProps) {
  const hoveringComponentValue = useRecoilValue(hoveringComponent);
  return (
    <>
      {hoveringComponentValue &&
        hoveringComponentValue.rects.map((rect, i) => (
          <OverlayDiv rect={rect} offset={offset} key={i} />
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
