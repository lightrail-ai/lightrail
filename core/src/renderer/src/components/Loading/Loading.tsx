import React from "react";
import logo from "./logo.png";

export interface LoadingProps {}

function Loading({}: LoadingProps) {
  return (
    <div className="h-fit w-[600px]">
      <div className="flex flex-row items-center justify-center gap-2 p-4">
        <img src={logo} alt="Lightrail Logo" className="h-10" />
        <div className="font-light text-4xl">Lightrail</div>
      </div>
      <div className="flex flex-row items-center justify-center gap-2 pb-4">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          ></circle>
          <path
            className="opacity-75"
            fill="#98d9f4"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <div className="font-light text-lg">Initializing...</div>
      </div>
    </div>
  );
}

export default Loading;
