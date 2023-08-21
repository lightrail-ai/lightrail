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
  ...props
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={classNames(
        "px-2 py-1 rounded-sm transition-colors",
        {
          "bg-neutral-300 text-neutral-950 hover:bg-white ": primary,
          "bg-neutral-50 bg-opacity-10 text-neutral-50 hover:bg-opacity-20":
            !primary,
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
