import React, { useEffect, useMemo, useState } from "react";
import { Column, Table } from "../ProjectEditor/editor-types";
import Loader from "../Loader/Loader";
import { queryProjectDb } from "@/util/util";
import { Db } from "@/util/storage";
import DataGrid from "react-data-grid";
import Button from "../Button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase } from "@fortawesome/free-solid-svg-icons";
import TableModificationModal from "../TableModificationModal/TableModificationModal";

import "react-data-grid/lib/styles.css";
import "./styles.css";

const renderCell = (props: any) => {
  const value = props.row[props.column.key];
  if (value === true || value === false) {
    return value ? "true" : "false";
  }
  return value;
};

export interface TableExplorerProps {
  table: Table;
  database: Db;
}

function TableExplorer({ table, database }: TableExplorerProps) {
  const [columns, setColumns] = useState<Column[]>(table.columns);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modificationModalVisible, setModificationModalVisible] =
    useState(false);

  useEffect(() => {
    refreshTable();
  }, [table.table_name]);

  async function refreshTable() {
    setLoading(true);
    await Promise.all([refreshColumns(), refreshRows()]);
    setLoading(false);
  }

  async function refreshColumns() {
    const { rows } = await queryProjectDb(
      database,
      `SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name='${table.table_name}';`
    );
    setColumns(rows);
  }

  async function refreshRows() {
    const { rows } = await queryProjectDb(
      database,
      `SELECT * FROM ${table.table_name};`
    );
    setRows(rows);
  }

  const dataGridColumns = useMemo(
    () =>
      columns.map((c) => ({
        key: c.column_name,
        name: c.column_name,
        renderCell,
      })),
    [columns]
  );

  if (loading)
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Loader />
      </div>
    );

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-row items-center m-4">
        <div className="bg-sky-300 rounded-lg px-2 py-0.5 text-slate-900 inline-flex justify-center items-center transition-all">
          {table.table_name}
        </div>
        <div className="flex-1" />
        <Button onClick={() => setModificationModalVisible(true)}>
          <FontAwesomeIcon icon={faDatabase} className="mr-2" />
          Modify
        </Button>
      </div>
      <div className="m-4 border rounded-lg overflow-clip shadow flex-1">
        <DataGrid columns={dataGridColumns} rows={rows} className="h-full" />
      </div>
      <TableModificationModal
        database={database}
        table={table}
        schema={columns}
        onClose={() => setModificationModalVisible(false)}
        onTableModified={refreshTable}
        visible={modificationModalVisible}
      />
    </div>
  );
}

export default TableExplorer;
