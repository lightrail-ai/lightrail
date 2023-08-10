import classNames from "classnames";
import React from "react";

export interface ButtonProps {
  children: React.ReactNode;
  primary?: boolean;
}

function Button({
  children,
  primary,
  ...props
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={classNames(
        "px-2 py-1 rounded-sm transition-colors hover:scale-105 active:scale-95",
        {
          "bg-neutral-50 text-neutral-950 hover:bg-white ": primary,
          "bg-neutral-50 text-neutral-900": !primary,
        }
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
