import React, { useState } from "react";
import Modal from "../Modal/Modal";
import classNames from "classnames";
import Button from "../Button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SERVER_URL } from "@/util/constants";
import {
  Db,
  FileQueryItem,
  FileStateItem,
  ProjectWithFiles,
} from "@/util/storage";
import * as SQLFormat from "sql-formatter";
import CodeEditor from "../CodeEditor/CodeEditor";
import { sanitizeVariableName } from "@/util/util";
import { faArrowRight, faPlay } from "@fortawesome/free-solid-svg-icons";
import { Table } from "../ProjectEditor/editor-types";
import { getJSONFromStream } from "@/util/transfers";

export interface StateAddingModalProps {
  visible: boolean;
  onClose: () => void;
  onStateAdded: () => void;
  project: ProjectWithFiles;
  componentName: string;
  state: FileStateItem[];
}

function StateAddingModal({
  visible,
  onClose,
  onStateAdded,
  project,
  componentName,
  state,
}: StateAddingModalProps) {
  const [name, setName] = useState("");
  const [initialValue, setInitialValue] = useState("");
  const [loading, setLoading] = useState(false);

  async function addState() {
    setLoading(true);
    let initial = null;
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
          state: [...state, { name, initial }],
        }),
      }
    );
    setLoading(false);
    onStateAdded();
    onClose();
  }

  return (
    <Modal
      visible={visible}
      onClose={onClose}
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

          <Button className="w-full mt-4" onClick={addState} disabled={loading}>
            Add State Variable
            <FontAwesomeIcon icon={faArrowRight} className="pl-2" />
          </Button>
        </div>
      }
    />
  );
}

export default StateAddingModal;
