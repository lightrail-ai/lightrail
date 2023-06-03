import React, { useEffect, useMemo, useRef } from "react";
import { EditorState } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
} from "@codemirror/view";

import {
  foldGutter,
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  foldKeymap,
  StreamLanguage,
} from "@codemirror/language";

import { defaultKeymap, historyKeymap } from "@codemirror/commands";
import { html } from "@codemirror/lang-html";
import { dracula } from "thememirror";
import "./custom-styles.css";
import classNames from "classnames";

export interface CodeEditorProps {
  value: string;
  path?: string;
  language?: string;
  className?: string;
}

function CodeEditor({ value, className }: CodeEditorProps) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;
    const state = EditorState.create({
      doc: value,
      extensions: [
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        drawSelection(),
        bracketMatching(),
        highlightActiveLine(),
        keymap.of([...defaultKeymap, ...historyKeymap, ...foldKeymap]),
        html(),
        dracula,
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
        "border bg-neutral-100 dark:bg-[#3a3d41] dark:border-neutral-800 rounded-lg overflow-clip flex flex-col shadow-md",
        className
      )}
    >
      {editorDom}
    </div>
  );
}

export default CodeEditor;
