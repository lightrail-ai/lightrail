import React from "react";

export interface ErrorProps {
  error: string | null;
}

function ErrorDisplay({ error }: ErrorProps) {
  return error ? (
    <div className="mx-2 text-sm my-0.5 border-red-900 border rounded bg-red-900 bg-opacity-10 px-2 py-0.5 text-red-800">
      <div className="text-neutral-300">
        Your action failed with the following error:
      </div>
      <div className="pl-2 py-0.5 italic">{error}</div>
      <div className="text-neutral-500">
        Run a new action to dismiss this error.
      </div>
    </div>
  ) : null;
}

export default ErrorDisplay;
