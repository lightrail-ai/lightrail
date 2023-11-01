import React from "react";
import PromptEditor, { promptSchema } from "../PromptEditor/PromptEditor";
import { EditorState } from "prosemirror-state";
import { Node } from "prosemirror-model";
import ReactMarkdown from "react-markdown";
import CodeViewer from "../CodeViewer/CodeViewer";
import type { ChatHistoryItem } from "lightrail-sdk";
import Button from "../ui-elements/Button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard, faCopy } from "@fortawesome/free-regular-svg-icons";
import { trpcClient } from "@renderer/util/trpc-client";

export interface ChatHistoryProps {
  items: ChatHistoryItem[];
  partialMessage: string | null;
  onReset?: () => void;
}

function ChatHistory({ items, partialMessage, onReset }: ChatHistoryProps) {
  function renderChatHistoryItem(item: ChatHistoryItem, index: number) {
    switch (item.sender) {
      case "user":
        return (
          <div className="mx-4 py-2 text-neutral-500" key={index}>
            <PromptEditor
              readonly
              state={EditorState.create({
                doc: Node.fromJSON(promptSchema, item.content),
                schema: promptSchema,
                plugins: [],
              })}
              onChange={() => {}}
            />
          </div>
        );
      case "ai":
        return (
          <div
            className="mx-4 relative px-2 my-2 border-l-4 border-l-neutral-500 prose prose-invert prose-pre:bg-transparent prose-pre:py-0 prose-pre:my-0"
            key={index}
          >
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const lang = match ? match[1] : undefined;
                  const code = String(children).replace(/\n$/, "");
                  return !inline ? (
                    <CodeViewer code={code} language={lang} {...props} />
                  ) : (
                    <code {...props} className={className}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {item.content}
            </ReactMarkdown>
            <div
              onClick={() => trpcClient.clipboard.mutate(item.content)}
              title="Copy Markdown"
              className="absolute right-0 bottom-0 opacity-30 hover:opacity-100 cursor-pointer active:text-green-500"
            >
              <FontAwesomeIcon icon={faCopy} />
            </div>
          </div>
        );
    }
  }

  return (
    <>
      {items.length > 0 && (
        <div className="flex-shrink-0 flex items-center text-sm border-b border-b-neutral-800">
          <div className="flex-1 px-2 opacity-25 text-xs">Lightrail</div>
          {onReset && <Button onClick={onReset}>Reset Conversation</Button>}
        </div>
      )}
      <div className="flex-grow flex-shrink min-h-0 overflow-auto flex flex-col-reverse">
        <div>
          {items.map(renderChatHistoryItem)}
          {partialMessage &&
            renderChatHistoryItem(
              {
                sender: "ai",
                content: partialMessage,
              },
              items.length
            )}
        </div>
      </div>
    </>
  );
}

export default ChatHistory;
