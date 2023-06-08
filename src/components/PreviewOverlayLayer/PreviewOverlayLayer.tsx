import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import {
  hoveringComponent,
  previewIframeRef,
} from "../PreviewRenderer/preview-renderer-state";
import NamePopover from "../NamePopover/NamePopover";

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function OverlayDiv({ rect }: { rect: Rect }) {
  const [correctedRect, setCorrectedRect] = useState<Rect | null>();
  const previewIframeRefValue = useRecoilValue(previewIframeRef);

  useEffect(() => {
    setCorrectedRect({
      top:
        rect.top +
        (previewIframeRefValue?.contentWindow?.document.body.scrollTop ?? 0),

      left:
        rect.left +
        (previewIframeRefValue?.contentWindow?.document.body.scrollLeft ?? 0),

      width: rect.width,
      height: rect.height,
    });
  }, [rect]);

  if (!correctedRect) return null;

  return (
    <div
      className="absolute bg-sky-300 border-sky-600 border-2 rounded-sm opacity-50 cursor-pointer pointer-events-none"
      style={correctedRect}
    />
  );
}

export interface PreviewOverlayLayerProps {}

function PreviewOverlayLayer({}: PreviewOverlayLayerProps) {
  const hoveringComponentValue = useRecoilValue(hoveringComponent);

  return (
    <>
      {hoveringComponentValue &&
        hoveringComponentValue.rects.map((rect, i) => (
          <OverlayDiv rect={rect} key={i} />
        ))}
      <NamePopover />
    </>
  );
}

export default PreviewOverlayLayer;
