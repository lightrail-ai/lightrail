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
import { faArrowRight, faPlay } from "@fortawesome/free-solid-svg-icons";
import { Table } from "../ProjectEditor/editor-types";
import { getJSONFromStream } from "@/util/transfers";

export interface ComponentQueryEditingModalProps {
  visible: boolean;
  onClose: () => void;
  onQueryCreated: () => void;
  project: ProjectWithFiles;
  componentName: string;
  databases: Db[];
  tables: Table[];
  queries: FileQueryItem[];
}

function ComponentQueryEditingModal({
  visible,
  onClose,
  onQueryCreated,
  project,
  databases,
  componentName,
  tables,
  queries,
}: ComponentQueryEditingModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [generatedQuery, setGeneratedQuery] = useState("");

  async function fetchQuery() {
    setLoading(true);
    const result = await fetch(
      `${SERVER_URL}/api/projects/${databases[0].project_id}/databases/${databases[0].id}/queries`,
      {
        method: "POST",
        body: JSON.stringify({
          type: "component_data_fetching",
          projectId: project.id,
          filePath: componentName,
          tables: tables,
          queryName: name,
        }),
      }
    );
    const json = await getJSONFromStream(result);
    const formattedQuery = SQLFormat.format(json.query, {
      language: "postgresql",
    });
    setGeneratedQuery(formattedQuery);
    setQuery(json.query);
    setLoading(false);
  }

  async function saveQuery() {
    setLoading(true);
    await fetch(
      `${SERVER_URL}/api/projects/${project.id}/files/${componentName}`,
      {
        method: "PUT",
        body: JSON.stringify({
          queries: [...queries, { name, query }],
        }),
      }
    );
    setLoading(false);
    onQueryCreated();
    onClose();
  }

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={"New Query"}
      content={
        <div
          className={classNames("pb-4", {
            "opacity-30": loading,
          })}
        >
          <input
            className={classNames(
              "transition-all w-full bg-slate-200 shadow-inner text-slate-900 rounded-lg p-3 mt-0.5 mb-4"
            )}
            value={name}
            disabled={loading}
            placeholder={`Query Variable Name`}
            onChange={(e) => {
              setName(sanitizeVariableName(e.target.value));
            }}
          />

          {query ? (
            <>
              <div className="w-full bg-slate-200 shadow-inner text-slate-900 rounded-lg p-3 mb-4 max-h-64 overflow-auto">
                <CodeEditor
                  type="sql"
                  value={generatedQuery}
                  onValueChange={(newVal) => setQuery(newVal)}
                />
              </div>
              <div className="flex flex-row gap-2">
                <Button
                  onClick={fetchQuery}
                  disabled={loading}
                  className="flex-1"
                  secondary
                >
                  Regnerate SQL
                </Button>
                <Button
                  onClick={saveQuery}
                  disabled={loading}
                  className="flex-1"
                >
                  <FontAwesomeIcon icon={faPlay} className="pr-2" />
                  Create Query
                </Button>
              </div>
            </>
          ) : (
            <Button
              className="w-full mt-4"
              onClick={fetchQuery}
              disabled={loading}
            >
              Suggest Query
              <FontAwesomeIcon icon={faArrowRight} className="pl-2" />
            </Button>
          )}
        </div>
      }
    />
  );
}

export default ComponentQueryEditingModal;
