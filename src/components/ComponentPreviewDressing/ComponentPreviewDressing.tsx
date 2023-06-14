import React from "react";
import PreviewFrame from "../PreviewFrame/PreviewFrame";

export interface ComponentPreviewDressingProps {
  children: React.ReactNode;
}

function ComponentPreviewDressing({ children }: ComponentPreviewDressingProps) {
  return <div className="resize border-4 m-auto overflow-auto">{children}</div>;
}

export default ComponentPreviewDressing;
