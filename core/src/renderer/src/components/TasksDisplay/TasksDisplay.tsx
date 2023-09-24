import { TaskProgress } from "lightrail-sdk";
import React from "react";
import Spinner from "../Spinner/Spinner";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export interface TaskStatus {
  id: string;
  progress: TaskProgress;
  message: string;
}
export interface TasksDisplayProps {
  statuses: TaskStatus[];
}

function TasksDisplay({ statuses }: TasksDisplayProps) {
  const [parent, _] = useAutoAnimate({
    duration: 100,
  });

  function renderProgress(progress: TaskProgress) {
    if (progress === undefined) return <></>;
    const progressArray: [number, number] =
      typeof progress === "number" ? [progress, 100] : progress;
    return (
      <>
        <div className="flex-1 rounded-full h-1.5 dark:bg-gray-700 border border-neutral-700">
          <div
            className="bg-neutral-700 h-full rounded-full dark:bg-blue-500"
            style={{
              width: `${
                Math.min(progressArray[0] / progressArray[1], 1) * 100
              }%`,
            }}
          />
        </div>
        <div>
          {typeof progress === "number"
            ? `${progress}%`
            : `${progress[0]} / ${progressArray[1]}`}
        </div>
      </>
    );
  }
  return (
    <div ref={parent}>
      {statuses.map((s) => (
        <div className="flex flex-row items-center text-xs gap-4 px-4 pt-0.5 pb-1 border-t border-t-neutral-900 font-light">
          {s.message}
          {s.progress === undefined ? (
            <div className="flex-1" />
          ) : (
            renderProgress(s.progress)
          )}
          <Spinner />
        </div>
      ))}
    </div>
  );
}

export default TasksDisplay;
