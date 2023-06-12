import Loader from "@/components/Loader/Loader";
import React from "react";

export interface LoadingSplashOverlayProps {
  message: string;
}

function LoadingSplashOverlay({ message }: LoadingSplashOverlayProps) {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-slate-50 z-[2147483647]">
      <Loader />
      <div className="mt-4 font-semibold italic">{message}</div>
    </div>
  );
}

export default LoadingSplashOverlay;
