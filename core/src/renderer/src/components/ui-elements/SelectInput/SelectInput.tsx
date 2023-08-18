import React from "react";

export interface SelectInputProps {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function SelectInput({
  label,
  value,
  placeholder,
  options,
  onChange,
}: SelectInputProps) {
  return (
    <label className="group transition-colors">
      <div className="text-xs opacity-50 group-focus-within:opacity-100">
        {label}
      </div>
      <select
        placeholder={placeholder}
        className="bg-neutral-50 px-2 py-1 bg-opacity-5 focus:bg-opacity-10 placeholder:text-neutral-600 focus:outline-none border-none outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
            className="bg-neutral-900 border-none hover:bg-neutral-800"
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default SelectInput;
