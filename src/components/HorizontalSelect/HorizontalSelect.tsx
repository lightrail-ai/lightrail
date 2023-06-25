import React from "react";

export interface HorizontalSelectProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

export default function HorizontalSelect(props: HorizontalSelectProps) {
  return (
    <>
      <div className="flex">
        {props.options.map((option, index) => (
          <button
            key={index}
            className={`px-4 text-sm border transition duration-500 text-gray-700 border-gray-300 ${
              index === 0 ? "rounded-l-2xl" : ""
            } ${index === props.options.length - 1 ? "rounded-r-2xl" : ""} ${
              props.value === option.value
                ? "bg-sky-600 text-white"
                : "bg-white hover:bg-sky-600 hover:bg-opacity-10"
            }`}
            onClick={() => props.onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </>
  );
}
