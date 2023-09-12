import { useEffect, useMemo, useRef } from "react";
import { EditorState, Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema } from "prosemirror-model";
import classNames from "classnames";

import "prosemirror-view/style/prosemirror.css";
import "./style.css";
import { rendererTracksManager } from "@renderer/util/lightrail-renderer";
import { htmlToElement } from "@renderer/util/util";

export const promptSchema = new Schema({
  nodes: {
    text: { group: "inline", inline: true },
    token: {
      attrs: {
        track: {},
        name: {},
        args: {},
      },
      inline: true,
      group: "inline",
      toDOM: (node) => {
        const token = rendererTracksManager.getTokenHandle(
          node.attrs.track,
          node.attrs.name
        );
        let domNode = document.createElement("span");
        domNode.className = "text-sm px-2 py-0.5 my-0.5 rounded-sm border-b";
        if (token) {
          domNode.style.backgroundColor = token.color + "30";
          domNode.style.borderBottomColor = token.color;
          domNode.style.color = token.color;
          const rendered = token.render(node.attrs.args);
          if (typeof rendered === "string") {
            domNode.innerText = rendered;
          } else {
            domNode.appendChild(
              htmlToElement(
                `<span><span class="opacity-50">${node.attrs.track}.</span>${
                  node.attrs.name
                }${rendered.map(
                  (r) =>
                    `<span class="mx-1 px-1 rounded-md" style="background-color: ${token.color}50">${r}</span>`
                )}</span>`
              )!
            );
          }
        }
        return domNode;
      },
    },
    doc: { content: "inline*" },
  },
});

export function placeholderPlugin(text: string) {
  const update = (view: EditorView) => {
    if (view.state.doc.content.size > 0) {
      view.dom.removeAttribute("data-placeholder");
    } else {
      view.dom.setAttribute("data-placeholder", text);
    }
  };

  return new Plugin({
    view(view) {
      update(view);
      return { update };
    },
  });
}

export interface PromptEditorProps {
  className?: string;
  onChange: (value: EditorState) => void;
  state: EditorState;
  readonly?: boolean;
  onViewReady?: (view: EditorView) => void;
}

function PromptEditor({
  className,
  onChange,
  state,
  readonly,
  onViewReady,
}: PromptEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorView = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    editorView.current = new EditorView(editorRef.current, {
      state,
      dispatchTransaction(transaction) {
        let newState = editorView.current!.state.apply(transaction);
        onChange?.(newState);
      },
      editable: () => !readonly,
    });

    editorView.current.focus();
    onViewReady?.(editorView.current);

    return () => {
      editorView.current!.destroy();
    };
  }, []);

  useEffect(() => {
    editorView.current?.updateState(state);
  }, [state]);

  const editorDom = useMemo(() => <div ref={editorRef} />, []);

  return <div className={classNames(className)}>{editorDom}</div>;
}

export default PromptEditor;
