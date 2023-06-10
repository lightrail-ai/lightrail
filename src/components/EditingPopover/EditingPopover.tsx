import React, { useState } from "react";
import { usePopper } from "react-popper";
import { useRecoilValue } from "recoil";
import { editingPopoverTarget } from "../PreviewRenderer/preview-renderer-state";
import classNames from "classnames";
import { ProjectWithFiles } from "@/util/storage";
import ComponentEditingPane from "../ComponentEditingPane/ComponentEditingPane";
import { ComponentCreationCallback } from "../ProjectEditor/editor-types";

export interface EditingPopoverProps {
  project: ProjectWithFiles;
  onUpdate: (newContent: string) => void;
  onMessage: (message: string) => void;
  onCreateComponent: (
    name: string,
    callback: ComponentCreationCallback
  ) => void;
}

function EditingPopover({
  project,
  onUpdate,
  onMessage,
  onCreateComponent,
}: EditingPopoverProps) {
  const target = useRecoilValue(editingPopoverTarget);

  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const [arrowElement, setArrowElement] = useState<HTMLElement | null>(null);
  const { styles, attributes } = usePopper(target, popperElement, {
    modifiers: [
      { name: "arrow", options: { element: arrowElement } },
      {
        name: "offset",
        options: {
          offset: [0, 8],
        },
      },
      {
        name: "preventOverflow",
        options: {
          mainAxis: false, // true by default
        },
      },
    ],
  });
  return (
    <div
      className={classNames(
        "transition-all bg-slate-800 text-slate-200 shadow-md px-6 py-4 rounded-lg border-2 border-slate-600",
        {
          hidden: !target,
          block: target,
        }
      )}
      ref={setPopperElement}
      style={styles.popper}
      {...attributes.popper}
    >
      <div className="max-h-[32rem] max-w-3xl flex flex-col min-h-0">
        <ComponentEditingPane
          project={project}
          onUpdate={onUpdate}
          onMessage={onMessage}
          onCreateComponent={onCreateComponent}
        />
      </div>
      <div
        className="popper-arrow"
        ref={setArrowElement}
        style={styles.arrow}
      />
    </div>
  );
}

export default EditingPopover;
