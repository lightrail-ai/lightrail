import React from "react";

export interface TextInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

function TextInput({ label, value, placeholder, onChange }: TextInputProps) {
  return (
    <label className="group transition-colors">
      <div className="text-xs opacity-50 group-focus-within:opacity-100">
        {label}
      </div>
      <input
        type="text"
        placeholder={placeholder}
        className="bg-neutral-50 px-2 py-1 bg-opacity-5 focus:bg-opacity-10 placeholder:text-neutral-600 focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export default TextInput;
