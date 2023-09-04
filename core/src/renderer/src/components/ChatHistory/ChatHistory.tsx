import React from "react";
import PromptEditor, { promptSchema } from "../PromptEditor/PromptEditor";
import { EditorState } from "prosemirror-state";
import { Node } from "prosemirror-model";
import ReactMarkdown from "react-markdown";
import CodeViewer from "../CodeViewer/CodeViewer";
import type { ChatHistoryItem } from "lightrail-sdk";

export interface ChatHistoryProps {
  items: ChatHistoryItem[];
  partialMessage: string | null;
}

function ChatHistory({ items, partialMessage }: ChatHistoryProps) {
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
            className="mx-4 px-2 my-2 border-l-4 border-l-neutral-500 prose prose-invert prose-pre:bg-transparent prose-pre:py-0 prose-pre:my-0"
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
          </div>
        );
      case "error":
        return (
          <div
            className="mx-4 px-2 my-2 border-l-4 text-red-900 border-l-red-900 bg-red-900 bg-opacity-10 prose prose-invert"
            key={index}
          >
            {item.content.replaceAll('":"', '": "')}
          </div>
        );
    }
  }

  return (
    <div className="border-b border-b-neutral-800 flex-grow flex-shrink min-h-0 overflow-auto flex flex-col-reverse">
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
  );
}

export default ChatHistory;
