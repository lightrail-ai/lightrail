import { useEffect, useMemo, useRef } from "react";
import { EditorState, Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema } from "prosemirror-model";
import classNames from "classnames";

import "prosemirror-view/style/prosemirror.css";
import "./style.css";
import { rendererLightrail } from "@renderer/util/renderer-lightrail";

export const promptSchema = new Schema({
  nodes: {
    text: { group: "inline", inline: true },
    token: {
      attrs: {
        name: {},
        args: {},
      },
      inline: true,
      group: "inline",
      toDOM: (node) => {
        const token = rendererLightrail.tokens.get(node.attrs.name);
        let domNode = document.createElement("span");
        domNode.className = "text-sm px-2 py-0.5 my-0.5 rounded-full";
        if (token) {
          domNode.style.backgroundColor = token.colors[0];
          domNode.style.color = token.colors[1];
          console.log(node.attrs);
          domNode.innerText = token.renderer(node.attrs.args);
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
}

function PromptEditor({
  className,
  onChange,
  state,
  readonly,
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
