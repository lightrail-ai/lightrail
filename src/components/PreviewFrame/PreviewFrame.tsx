import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRecoilState } from "recoil";
import { previewIframeRef } from "../PreviewRenderer/preview-renderer-state";
import classNames from "classnames";
import { PreviewRendererProps } from "../PreviewRenderer";
import PreviewRenderer from "../PreviewRenderer/PreviewRenderer";
import { SERVER_URL } from "@/util/constants";

export type PreviewFrameProps = PreviewRendererProps & {
  transparent?: boolean;
};

function PreviewFrame({
  transparent,
  onRenderComplete,
  ...props
}: PreviewFrameProps) {
  const [iframeRef, setIframeRef] = useRecoilState(previewIframeRef);
  const [tailwindReady, setTailwindReady] = useState(false);

  useEffect(() => {
    if (tailwindReady) {
      onRenderComplete?.();
    }
  }, [tailwindReady]);

  function injectLibraries() {
    if (iframeRef && iframeRef.contentWindow) {
      const doc = iframeRef.contentWindow!.document;
      var tailwind = doc.createElement("script");
      tailwind.src = "https://cdn.tailwindcss.com";
      tailwind.onload = () => {
        setTailwindReady(true);
      };
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
      const previewCss = doc.createElement("link");
      previewCss.rel = "stylesheet";
      previewCss.href = SERVER_URL + "/preview-styling.css";
      doc.head.appendChild(previewCss);
    }
  }

  function handleRenderComplete() {
    console.log("RENDER COMPLETE");
    injectLibraries();
  }

  const mountNode = iframeRef?.contentWindow?.document.body;
  return (
    <iframe
      ref={setIframeRef}
      className={classNames(`w-full h-full`, {
        "bg-white": !transparent,
        "bg-transparent": transparent,
      })}
    >
      {mountNode &&
        createPortal(
          <PreviewRenderer
            {...props}
            onRenderComplete={handleRenderComplete}
            ready={tailwindReady}
          />,
          mountNode
        )}
    </iframe>
  );
}

export default PreviewFrame;
