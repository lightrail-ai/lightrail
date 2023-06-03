import React, { useEffect } from "react";
import ProgressBar from "@/components/ProgressBar";

export interface TimerProgressBarProps {
  duration: number; // in seconds
  caption?: string;
}

function TimerProgressBar({ duration, caption }: TimerProgressBarProps) {
  const [progress, setProgress] = React.useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => Math.min(90, p + 95 / (2 * duration)));
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return <ProgressBar progress={progress} caption={caption} />;
}

export default TimerProgressBar;
