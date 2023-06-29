import React from "react";

export interface VariableTokenProps {
  name: string;
  subName?: string;
  value?: string;
  onClick?: () => void;
}

function VariableToken({ name, subName, value, onClick }: VariableTokenProps) {
  return (
    <div
      onClick={onClick}
      className="inline-flex flex-row leading-none rounded-md px-2 py-1 text-sm bg-slate-100 text-slate-800 border-2"
    >
      <div className="px-2 py-0.5">
        <div className="">{name}</div>
        {subName && <div className="text-xs opacity-50">{subName}</div>}
      </div>
      {value && (
        <div className="border-l flex items-center justify-center px-2 py-0.5 font-mono opacity-50">
          {value}
        </div>
      )}
    </div>
  );
}

export default VariableToken;
