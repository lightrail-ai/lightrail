import React from "react";
import logo from "./logo.png";
import Spinner from "../Spinner/Spinner";

export interface LoadingProps {}

function Loading({}: LoadingProps) {
  return (
    <div className="h-fit w-[600px]">
      <div className="flex flex-row items-center justify-center gap-2 p-4">
        <img src={logo} alt="Lightrail Logo" className="h-10" />
        <div className="font-light text-4xl">Lightrail</div>
      </div>
      <div className="flex flex-row items-center justify-center gap-2 pb-4">
        <Spinner />
        <div className="font-light text-lg">Initializing...</div>
      </div>
    </div>
  );
}

export default Loading;
