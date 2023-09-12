import React from "react";

export interface TextInputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  containerClassName?: string;
  inputClassName?: string;
}

function TextInput({
  label,
  value,
  placeholder,
  onChange,
  containerClassName,
  inputClassName,
}: TextInputProps) {
  return (
    <label className={"group transition-colors " + containerClassName}>
      {label && (
        <div className="text-xs opacity-50 group-focus-within:opacity-100">
          {label}
        </div>
      )}
      <input
        type="text"
        placeholder={placeholder}
        className={
          "bg-neutral-50 px-2 py-1 bg-opacity-5 focus:bg-opacity-10 placeholder:text-neutral-600 focus:outline-none " +
          inputClassName
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export default TextInput;
