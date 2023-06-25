import React, { useState } from "react";
import Modal from "../Modal/Modal";
import classNames from "classnames";
import HorizontalSelect from "../HorizontalSelect/HorizontalSelect";
import Button from "../Button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SERVER_URL } from "@/util/constants";
import { Db } from "@/util/storage";
import * as SQLFormat from "sql-formatter";
import CodeEditor from "../CodeEditor/CodeEditor";
import { queryProjectDb } from "@/util/util";

export interface TableCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onTableCreated: () => void;
  database: Db;
}

const sanitizeTableName = (name: string) => {
  const sanitized = name
    .replaceAll(/\s+/g, "_")
    .replaceAll(/-{1}/g, "_")
    .replaceAll(/[^a-zA-Z0-9_]/g, "")
    .replaceAll(/^[^a-zA-Z]+/g, "");
  return sanitized.toLowerCase();
};

function TableCreationModal({
  visible,
  onClose,
  onTableCreated,
  database,
}: TableCreationModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [generatedQuery, setGeneratedQuery] = useState("");

  async function fetchCreationQuery() {
    setLoading(true);
    const result = await fetch(
      `${SERVER_URL}/api/projects/${database.project_id}/databases/${database.id}/queries`,
      {
        method: "POST",
        body: JSON.stringify({
          type: "table",
          name,
          description,
        }),
      }
    );
    const json = await result.json();
    const fomrattedQuery = SQLFormat.format(json.query, {
      language: "postgresql",
    });
    setGeneratedQuery(fomrattedQuery);
    setQuery(json.query);
    setLoading(false);
  }

  async function createTable() {
    setLoading(true);
    await queryProjectDb(database, query);
    onTableCreated();
    onClose();
  }

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="New Table"
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
            placeholder={`Table Name`}
            onChange={(e) => {
              setName(sanitizeTableName(e.target.value));
            }}
          />
          <label className="block mb-1 text-sm font-semibold text-gray-900 ">
            Description
          </label>
          <textarea
            className={classNames(
              "transition-all w-full bg-slate-200 shadow-inner text-slate-900 rounded-lg p-3",
              {}
            )}
            value={description}
            disabled={loading}
            placeholder={`Describe the table you'd like to create!`}
            onChange={(e) => setDescription(e.target.value)}
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
                  onClick={fetchCreationQuery}
                  disabled={loading}
                  className="flex-1"
                  secondary
                >
                  Regnerate SQL
                </Button>
                <Button
                  onClick={createTable}
                  disabled={loading}
                  className="flex-1"
                >
                  Create
                </Button>
              </div>
            </>
          ) : (
            <Button
              className="w-full mt-4"
              onClick={fetchCreationQuery}
              disabled={loading}
            >
              Continue <FontAwesomeIcon icon="arrow-right" className="pl-2" />
            </Button>
          )}
        </div>
      }
    />
  );
}

export default TableCreationModal;
