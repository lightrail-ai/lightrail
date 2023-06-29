import React, { useState } from "react";
import Modal from "../Modal/Modal";
import classNames from "classnames";
import Button from "../Button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SERVER_URL } from "@/util/constants";
import { Db, FileQueryItem, ProjectWithFiles } from "@/util/storage";
import * as SQLFormat from "sql-formatter";
import CodeEditor from "../CodeEditor/CodeEditor";
import { sanitizeVariableName } from "@/util/util";
import {
  faArrowRight,
  faCheck,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { Table } from "../ProjectEditor/editor-types";
import { getJSONFromStream } from "@/util/transfers";

export interface UpdateComponentTreeModalProps {
  visible: boolean;
  onClose: () => void;
  project: ProjectWithFiles;
  componentName: string;
  onUpdateComponentTree: () => void;
}

function UpdateComponentTreeModal({
  visible,
  onClose,
  project,
  componentName,
  onUpdateComponentTree,
}: UpdateComponentTreeModalProps) {
  const [loading, setLoading] = useState(false);

  async function updateComponent() {
    setLoading(true);
    const res = await fetch(
      `${SERVER_URL}/api/projects/${project.id}/files/${componentName}/contents`,
      {
        method: "PUT",
        body: JSON.stringify({
          modification:
            "Update the component tree to use the data from the SQL queries appropriately. Data from the queries will be available in a variable with the specified name, as an array of objects. If you replace sample/placeholder data with the data from the query, make sure to transform (using map, etc) the query data to have the same keys/structure as the sample data!",
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    await getJSONFromStream(res);

    setLoading(false);
    onUpdateComponentTree();
    onClose();
  }

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={"Update Component Tree"}
      content={
        <div
          className={classNames("pb-4", {
            "opacity-30": loading,
          })}
        >
          <p className="pb-4">
            Would you like to automatically update the component tree of{" "}
            <span className="font-mono">{componentName}</span> to use the data
            from the new query?
          </p>
          <div className="flex flex-row gap-2">
            <Button
              onClick={onClose}
              disabled={loading}
              className="flex-1"
              secondary
            >
              Not Now
            </Button>
            <Button
              onClick={updateComponent}
              disabled={loading}
              className="flex-1"
            >
              <FontAwesomeIcon icon={faCheck} className="pr-2" />
              Update JSX
            </Button>
          </div>
        </div>
      }
    />
  );
}

export default UpdateComponentTreeModal;
