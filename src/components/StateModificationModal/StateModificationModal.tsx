import React, { useEffect, useState } from "react";
import Modal from "../Modal/Modal";
import classNames from "classnames";
import Button from "../Button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SERVER_URL } from "@/util/constants";
import { FileStateItem, ProjectWithFiles } from "@/util/storage";
import { sanitizeVariableName } from "@/util/util";
import { faArrowRight, faTrash } from "@fortawesome/free-solid-svg-icons";

export interface StateModificationModalProps {
  visible: boolean;
  onClose: () => void;
  onStateModified: () => void;
  project: ProjectWithFiles;
  editingState: FileStateItem | null;
  componentName: string;
  state: FileStateItem[];
}

function StateModificationModal({
  visible,
  onClose,
  onStateModified,
  project,
  editingState,
  componentName,
  state,
}: StateModificationModalProps) {
  const [name, setName] = useState("");
  const [initialValue, setInitialValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && editingState) {
      setName(editingState.name);
      setInitialValue(JSON.stringify(editingState.initial));
    }
  }, [editingState, visible]);

  function close() {
    setName("");
    setInitialValue("");
    onClose();
  }

  async function updateState() {
    setLoading(true);
    let initial: any = null;
    try {
      initial = eval(initialValue);
    } catch (e) {
      initial = initialValue;
    }
    await fetch(
      `${SERVER_URL}/api/projects/${project.id}/files/${componentName}`,
      {
        method: "PUT",
        body: JSON.stringify({
          state: editingState
            ? state.map((s) =>
                s.name === editingState.name ? { name, initial } : s
              )
            : [...state, { name, initial }],
        }),
      }
    );
    setLoading(false);
    onStateModified();
    close();
  }

  async function deleteState() {
    setLoading(true);
    await fetch(
      `${SERVER_URL}/api/projects/${project.id}/files/${componentName}`,
      {
        method: "PUT",
        body: JSON.stringify({
          state: state.filter((s) => s.name !== editingState?.name),
        }),
      }
    );
    setLoading(false);
    onStateModified();
    close();
  }

  return (
    <Modal
      visible={visible}
      onClose={close}
      title={"Add State"}
      content={
        <div
          className={classNames("pb-4", {
            "opacity-30": loading,
          })}
        >
          <div className="flex flex-row gap-4">
            <input
              className={classNames(
                "transition-all flex-1 bg-slate-200 shadow-inner text-slate-900 rounded-lg p-3 mt-0.5 mb-4"
              )}
              value={name}
              disabled={loading}
              placeholder={`Name`}
              onChange={(e) => {
                setName(sanitizeVariableName(e.target.value));
              }}
            />
            <input
              className={classNames(
                "transition-all flex-1 bg-slate-200 shadow-inner text-slate-900 rounded-lg p-3 mt-0.5 mb-4 font-mono"
              )}
              value={initialValue}
              disabled={loading}
              placeholder={`Initial Value`}
              onChange={(e) => {
                setInitialValue(e.target.value);
              }}
            />
          </div>
          {editingState ? (
            <div className="flex flex-row gap-4 mt-4 justify-end">
              <Button onClick={deleteState} disabled={loading} secondary>
                <FontAwesomeIcon icon={faTrash} className="pr-2" />
                Delete State Variable
              </Button>
              <Button onClick={updateState} disabled={loading}>
                Update State Variable
                <FontAwesomeIcon icon={faArrowRight} className="pl-2" />
              </Button>
            </div>
          ) : (
            <Button
              className="w-full mt-4"
              onClick={updateState}
              disabled={loading}
            >
              Add State Variable
              <FontAwesomeIcon icon={faArrowRight} className="pl-2" />
            </Button>
          )}
        </div>
      }
    />
  );
}

export default StateModificationModal;
