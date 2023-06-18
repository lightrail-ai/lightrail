import { ProjectWithFiles } from "@/util/storage";
import React, { useMemo } from "react";
import { ReflexElement } from "react-reflex";
import {
  editingComponent,
  editingPopoverTarget,
} from "../PreviewRenderer/preview-renderer-state";
import { useSetRecoilState } from "recoil";
import Button from "../Button/Button";
import classNames from "classnames";

export interface ComponentsListPanelProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  project: ProjectWithFiles;
  onCreateComponent: (name: string) => void;
}

function ComponentsListPanel({
  isOpen,
  project,
  onCreateComponent,
}: ComponentsListPanelProps) {
  const setEditingComponent = useSetRecoilState(editingComponent);
  const setEditingPopoverTarget = useSetRecoilState(editingPopoverTarget);

  const orderedComponents = useMemo(() => {
    return project.files.slice().sort((a, b) => {
      if (a.path === "index") return -1;
      if (b.path === "index") return 1;

      return a.path.localeCompare(b.path);
    });
  }, [project.files]);

  return (
    <ReflexElement flex={isOpen ? 0.5 : 0}>
      <div className="flex flex-col min-h-full bg-slate-50 text-slate-800 px-4 py-2">
        <div className="text-xl font-semibold">Components</div>
        <div className="space-y-2 my-4">
          <Button
            className="w-full mt-4"
            onClick={(e) => onCreateComponent("")}
          >
            + New component
          </Button>
          {orderedComponents.map((file) => (
            <div
              className={classNames(
                `text-md px-2 py-1 bg-slate-100 rounded-md text-slate-800 cursor-pointer border-2 hover:opacity-70 hover:shadow-md active:shadow-inner hover:border-sky-300`,
                {
                  "border-slate-300": file.path !== "index",
                  "border-green-300": file.path === "index",
                }
              )}
              onClick={(e) => {
                setEditingComponent({ name: file.path });
                setEditingPopoverTarget(e.target as HTMLElement);
              }}
            >
              {file.path === "index" ? "index (root)" : file.path}
            </div>
          ))}
        </div>
      </div>
    </ReflexElement>
  );
}

export default ComponentsListPanel;
