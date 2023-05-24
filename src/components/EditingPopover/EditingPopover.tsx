import React, { useState } from "react";
import { usePopper } from "react-popper";
import { useRecoilValue } from "recoil";
import { editingPopoverTarget } from "../PreviewRenderer/preview-renderer-state";
import classNames from "classnames";
import { Project } from "@/util/storage";
import ComponentEditingPane from "../ComponentEditingPane/ComponentEditingPane";

export interface EditingPopoverProps {
  project: Project;
  onUpdate: (newContent: string) => void;
  onMessage: (message: string) => void;
}

function EditingPopover({ project, onUpdate, onMessage }: EditingPopoverProps) {
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
      <ComponentEditingPane
        project={project}
        onUpdate={onUpdate}
        onMessage={onMessage}
      />
      <div
        className="popper-arrow"
        ref={setArrowElement}
        style={styles.arrow}
      />
    </div>
  );
}

export default EditingPopover;
