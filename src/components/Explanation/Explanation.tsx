import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export interface ExplanationProps {
  text: string;
}

function Explanation({ text }: ExplanationProps) {
  return (
    <div
      className="inline hint--top hint--large hint--rounded text-sky-600 hover:text-sky-500 cursor-help"
      aria-label={text}
    >
      <FontAwesomeIcon icon={faQuestionCircle} />
    </div>
  );
}

export default Explanation;
