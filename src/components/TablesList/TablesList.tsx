import React, { useState } from "react";
import { Table } from "../ProjectEditor/editor-types";
import Button from "../Button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import TableCreationModal from "../TableCreationModal/TableCreationModal";
import { Db } from "@/util/storage";

export interface TablesListProps {
  tables: Table[];
  selectedTable: Table | null;
  onSelectTable: (table: Table) => void;
  onTablesUpdates: () => void;
  database: Db;
}

function TablesList({ tables, onTablesUpdates, database }: TablesListProps) {
  const [creationModalVisible, setCreationModalVisible] = useState(false);

  return (
    <>
      <div className="w-full h-full p-4 space-y-4">
        {tables.length > 0 ? (
          tables.map((table) => (
            <div className="text-md px-2 py-1 bg-slate-100 rounded-md text-slate-800 cursor-pointer border-2 hover:opacity-70 hover:shadow-md active:shadow-inner hover:border-sky-300">
              {table.table_name}
            </div>
          ))
        ) : (
          <div className="italic text-slate-500 text-center">
            No Tables to Show
          </div>
        )}
        <Button
          className="w-full"
          onClick={() => setCreationModalVisible(true)}
        >
          <FontAwesomeIcon icon={faPlus} className="pr-2" /> New Table
        </Button>
      </div>
      <TableCreationModal
        visible={creationModalVisible}
        onClose={() => setCreationModalVisible(false)}
        onTableCreated={() => {
          setCreationModalVisible(false);
          onTablesUpdates();
        }}
        database={database}
      />
    </>
  );
}

export default TablesList;
