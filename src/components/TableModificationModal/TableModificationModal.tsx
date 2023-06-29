import React, { useState } from "react";
import Modal from "../Modal/Modal";
import classNames from "classnames";
import Button from "../Button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SERVER_URL } from "@/util/constants";
import { Db } from "@/util/storage";
import * as SQLFormat from "sql-formatter";
import CodeEditor from "../CodeEditor/CodeEditor";
import { queryProjectDb } from "@/util/util";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { Column, Table } from "../ProjectEditor/editor-types";
import Select from "../Select/Select";
import { getJSONFromStream } from "@/util/transfers";

const MODIFICATION_TYPES = [
  {
    value: "data_generation",
    label: "Generate Data",
  },
  {
    value: "schema_modification",
    label: "Change Schema",
  },
  {
    value: "other",
    label: "Other...",
  },
];

export interface TableModificationModalProps {
  visible: boolean;
  table: Table;
  onClose: () => void;
  onTableModified: () => void;
  database: Db;
  schema: Column[];
}

function TableModificationModal({
  visible,
  onClose,
  table,
  onTableModified,
  database,
  schema,
}: TableModificationModalProps) {
  const [type, setType] = useState("data_generation");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [generatedQuery, setGeneratedQuery] = useState("");

  async function fetchQuery() {
    setLoading(true);
    const result = await fetch(
      `${SERVER_URL}/api/projects/${database.project_id}/databases/${database.id}/queries`,
      {
        method: "POST",
        body: JSON.stringify({
          name: table.table_name,
          schema: schema,
          type,
          description,
        }),
      }
    );
    const json = await getJSONFromStream(result);
    const fomrattedQuery = SQLFormat.format(json.query, {
      language: "postgresql",
    });
    setGeneratedQuery(fomrattedQuery);
    setQuery(json.query);
    setLoading(false);
  }

  async function runQuery() {
    setLoading(true);
    await queryProjectDb(database, query);
    onTableModified();
    onClose();
  }

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={
        <>
          Modify{" "}
          <span className="font-normal font-mono">{table.table_name}</span>
        </>
      }
      content={
        <div
          className={classNames("pb-4", {
            "opacity-30": loading,
          })}
        >
          <label className="block mb-1 text-sm font-semibold text-gray-900 ">
            Task
          </label>
          <Select
            options={MODIFICATION_TYPES}
            value={type}
            onChange={setType}
          />
          <label className="block mb-1 text-sm font-semibold text-gray-900 ">
            Modification
          </label>
          <textarea
            className={classNames(
              "transition-all w-full bg-slate-200 shadow-inner text-slate-900 rounded-lg p-3",
              {}
            )}
            value={description}
            disabled={loading}
            placeholder={`Describe desired modification...`}
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
                  onClick={fetchQuery}
                  disabled={loading}
                  className="flex-1"
                  secondary
                >
                  Regnerate SQL
                </Button>
                <Button
                  onClick={runQuery}
                  disabled={loading}
                  className="flex-1"
                >
                  <FontAwesomeIcon icon={faPlay} className="pr-2" />
                  Run
                </Button>
              </div>
            </>
          ) : (
            <Button
              className="w-full mt-4"
              onClick={fetchQuery}
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

export default TableModificationModal;
