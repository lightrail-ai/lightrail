import React from "react";
import Explanation from "../Explanation/Explanation";

export interface SelectProps {
  options: {
    value: string;
    label: string;
  }[];
  onChange: (value: string) => void;
  value: string;
}

function Select({ options, onChange, value }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className=" border text-sm font-semibold block w-full bg-slate-200 shadow-inner text-slate-700 rounded-lg p-3 mb-4"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default Select;
