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

function OverlayDiv({ rect, name }: { rect: Rect; name: string }) {
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
      className="overlay absolute border-sky-600 border-2 rounded-sm cursor-pointer pointer-events-none z-[9999]"
      style={{
        ...correctedRect,
        backgroundImage:
          "linear-gradient(45deg, rgb(2 132 199 / 0.3) 12.50%, transparent 12.50%, transparent 50%, rgb(2 132 199 / 0.3) 50%, rgb(2 132 199 / 0.3) 62.50%, transparent 62.50%, transparent 100%)",
        backgroundSize: "0.25rem 0.25rem",
      }}
    >
      <div className="px-1 py-2 bg-sky-600 text-sky-50 inline-block text-sm font-semibold">
        {name}
      </div>
    </div>
  );
}

export interface PreviewOverlayLayerProps {}

function PreviewOverlayLayer({}: PreviewOverlayLayerProps) {
  const hoveringComponentValue = useRecoilValue(hoveringComponent);

  return (
    <>
      {hoveringComponentValue &&
        hoveringComponentValue.rects.map((rect, i) => (
          <OverlayDiv name={hoveringComponentValue.name} rect={rect} key={i} />
        ))}
      {/* <NamePopover /> */}
    </>
  );
}

export default PreviewOverlayLayer;
