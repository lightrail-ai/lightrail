import React from "react";

export interface ProgressBarProps {
  progress: number;
  caption?: string;
}

function ProgressBar({ progress, caption }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-4 rounded-full  bg-green-700 transition-all"
          style={{ width: `${Math.round(progress)}%` }}
        ></div>
      </div>
      {caption && (
        <div className="italic opacity-30 p-0.5 text-left">{caption}</div>
      )}
    </div>
  );
}

export default ProgressBar;
