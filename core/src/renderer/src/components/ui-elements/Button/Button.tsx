import classNames from "classnames";
import React from "react";

export interface ButtonProps {
  children: React.ReactNode;
  primary?: boolean;
  className?: string;
}

function Button({
  children,
  primary,
  className,
  disabled,
  onClick,
  ...props
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={classNames(
        "px-2 py-1 rounded-sm transition-colors",
        {
          "bg-neutral-300 text-neutral-950": primary,
          "hover:bg-white ": !disabled && primary,
          "bg-neutral-50 bg-opacity-10 text-neutral-50": !primary,
          "hover:bg-opacity-20": !disabled && !primary,
          "opacity-20 cursor-not-allowed": disabled,
        },
        className
      )}
      onClick={disabled ? undefined : onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
