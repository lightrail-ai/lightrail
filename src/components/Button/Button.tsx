import classNames from "classnames";
import React, { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  secondary?: boolean;
};

function Button({ className, children, secondary, ...props }: ButtonProps) {
  return (
    <button
      className={classNames(
        `shadow-md p-2 rounded-lg disabled:opacity-20 font-semibold transition-all`,
        {
          "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-300 active:text-slate-900":
            !secondary,
          "bg-transparent border border-slate-900 text-slate-900 hover:bg-slate-200 active:bg-slate-300":
            secondary,
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
