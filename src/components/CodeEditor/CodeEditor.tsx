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
import { autocompletion } from "@codemirror/autocomplete";
import { ProjectWithFiles } from "@/util/storage";
import { componentAutocompletion } from "./component-autocomplete";
import { ComponentCreationCallback } from "../ProjectEditor/editor-types";

export interface CodeEditorProps {
  value: string;
  className?: string;
  onValueChange: (value: string) => void;
  project?: ProjectWithFiles;
  onCreateComponent: (
    name: string,
    callback: ComponentCreationCallback
  ) => void;
}

function CodeEditor({
  value,
  className,
  onValueChange,
  project,
  onCreateComponent,
}: CodeEditorProps) {
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
        // highlightActiveLine(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        langs.jsx(),
        tomorrow,
        componentAutocompletion(project, onCreateComponent),
      ],
    });

    const view = new EditorView({ state, parent: editorRef.current });

    return () => {
      view.destroy();
    };
  }, [value, project]);

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
