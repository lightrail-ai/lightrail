import React, { useEffect, useMemo, useRef } from "react";
import { EditorState } from "@codemirror/state";
import {
  EditorView,
  keymap,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
} from "@codemirror/view";

import { bracketMatching } from "@codemirror/language";

import { defaultKeymap, historyKeymap } from "@codemirror/commands";
import { tomorrow } from "thememirror";
import "./custom-styles.css";
import classNames from "classnames";
import { langs } from "@uiw/codemirror-extensions-langs";

export interface CodeEditorProps {
  value: string;
  className?: string;
  onValueChange: (value: string) => void;
}

function CodeEditor({ value, className, onValueChange }: CodeEditorProps) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;
    const state = EditorState.create({
      doc: value,
      extensions: [
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onValueChange(update.state.doc.toString());
          }
        }),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        drawSelection(),
        bracketMatching(),
        highlightActiveLine(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        langs.jsx(),
        tomorrow,
      ],
    });

    const view = new EditorView({ state, parent: editorRef.current });

    return () => {
      view.destroy();
    };
  }, [value]);

  const editorDom = useMemo(
    () => <div className="flex-1 min-h-0" ref={editorRef} />,
    []
  );

  return (
    <div
      className={classNames(
        "rounded-lg overflow-clip flex flex-col shadow-md",
        className
      )}
    >
      {editorDom}
    </div>
  );
}

export default CodeEditor;
