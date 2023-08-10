import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { trpcClient } from "@renderer/util/trpc-client";
import classNames from "classnames";
import { useState } from "react";

export interface CodeViewerProps {
  language?: string;
  code: string;
}

function CodeViewer({ language, code, ...props }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  return (
    <div>
      <div className="w-full flex flex-row border border-b-0 border-neutral-800 text-xs items-center rounded-t-sm">
        {language && <div className="px-2">{language}</div>}
        <div className="flex-1" />
        <button
          className={classNames("px-2 py-2 ", {
            "hover:bg-neutral-800 hover:text-white": !copied,
            "text-green-500 hover:cursor-default": copied,
          })}
          onClick={() => {
            setCopied(true);
            trpcClient.clipboard.mutate(code);
            setTimeout(() => setCopied(false), 1000);
          }}
        >
          <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="pr-2" />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <SyntaxHighlighter
        {...props}
        children={code}
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        className="rounded-b-sm"
        customStyle={{
          margin: 0,
        }}
      />
    </div>
  );
}

export default CodeViewer;
