import React, { useState } from "react";
import { usePopper } from "react-popper";
import {
  hoveringComponent,
  namePopoverTarget,
} from "../PreviewRenderer/preview-renderer-state";
import { useRecoilValue } from "recoil";
import classNames from "classnames";

export interface NamePopoverProps {}

function NamePopover({}: NamePopoverProps) {
  const target = useRecoilValue(namePopoverTarget);
  const hoveringComponentValue = useRecoilValue(hoveringComponent);

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
        "transition-all bg-slate-800 text-slate-200 shadow-md px-2 py-1 rounded-lg border-2 border-slate-600",
        {
          hidden: !target || !hoveringComponentValue?.name,
          block: target && hoveringComponentValue?.name,
        }
      )}
      ref={setPopperElement}
      style={styles.popper}
      {...attributes.popper}
    >
      {hoveringComponentValue?.name}
      <div
        className="popper-arrow "
        ref={setArrowElement}
        style={styles.arrow}
      />
    </div>
  );
}

export default NamePopover;
