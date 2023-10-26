import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export interface ErrorProps {
  error: string | null;
  onDismiss: () => void;
}

function ErrorDisplay({ error, onDismiss }: ErrorProps) {
  return error ? (
    <div className="mx-2 text-sm my-0.5 border-red-900 border rounded bg-red-900 bg-opacity-10 px-2 py-0.5 text-red-800 relative">
      <div
        className="absolute top-0 right-2 cursor-pointer opacity-80 hover:opacity-100"
        onClick={onDismiss}
      >
        <FontAwesomeIcon icon={faTimes} />
      </div>
      <div className="text-neutral-300">
        Your action failed with the following error:
      </div>
      <div className="pl-2 py-0.5 italic">{error}</div>
      <div className=" text-neutral-500">
        Does this seem like a bug?{" "}
        <a
          className="inline-block bg-neutral-50 bg-opacity-10 px-2 py-0 hover:bg-opacity-20 rounded hover:text-neutral-300"
          href="https://discord.com/invite/57bNyxgb7g"
        >
          Let us know!
        </a>
      </div>
    </div>
  ) : null;
}

export default ErrorDisplay;
