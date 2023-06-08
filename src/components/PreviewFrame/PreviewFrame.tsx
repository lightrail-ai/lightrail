import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useRecoilState } from "recoil";
import { previewIframeRef } from "../PreviewRenderer/preview-renderer-state";

export interface PreviewFrameProps {
  children?: React.ReactNode;
}

function PreviewFrame({ children }: PreviewFrameProps) {
  const [iframeRef, setIframeRef] = useRecoilState(previewIframeRef);

  useEffect(() => {
    if (iframeRef && iframeRef.contentWindow) {
      const doc = iframeRef.contentWindow.document;
      var tailwind = doc.createElement("script");
      tailwind.src = "https://cdn.tailwindcss.com";
      doc.head.appendChild(tailwind);
      const faCss = doc.createElement("link");
      faCss.rel = "stylesheet";
      faCss.href =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
      doc.head.appendChild(faCss);
      const faJs = doc.createElement("script");
      faJs.src =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js";
      doc.head.appendChild(faJs);
    }
  }, [iframeRef]);

  const mountNode = iframeRef?.contentWindow?.document.body;
  return (
    <iframe ref={setIframeRef} className="w-full h-full bg-white">
      {mountNode && createPortal(children, mountNode)}
    </iframe>
  );
}

export default PreviewFrame;
