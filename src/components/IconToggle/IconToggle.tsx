import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export interface IconToggleProps {
  trueIcon: IconDefinition;
  falseIcon: IconDefinition;
  onToggle: () => void;
  value: boolean;
}

function IconToggle({ trueIcon, falseIcon, onToggle, value }: IconToggleProps) {
  return (
    <div
      className="flex items-center cursor-pointer theme-toggle text-slate-700"
      onClick={onToggle}
    >
      <span className="font-semibold text-xs mr-2">
        <FontAwesomeIcon icon={falseIcon} />
      </span>
      <div
        className={`rounded-full w-12 h-4 p-0.5 transition shadow-inner bg-slate-300`}
      >
        <div
          className={`rounded-full w-3 h-3 bg-slate-700 ${
            value ? "translate-x-4" : "-translate-x-4"
          } transform mx-auto duration-300 ease-in-out`}
        ></div>
      </div>
      <span className="font-semibold text-xs ml-2">
        <FontAwesomeIcon icon={trueIcon} />
      </span>
    </div>
  );
}

export default IconToggle;
