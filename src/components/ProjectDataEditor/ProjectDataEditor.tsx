import { Db, Project } from "@/util/storage";
import React, { useEffect, useState } from "react";
import Button from "../Button/Button";
import { SERVER_URL } from "@/util/constants";
import Loader from "../Loader/Loader";
import { queryProjectDb } from "@/util/util";
import TablesList from "../TablesList/TablesList";
import { Table } from "../ProjectEditor/editor-types";

export interface ProjectDataEditorProps {
  project: Project;
}

function ProjectDataEditor({ project }: ProjectDataEditorProps) {
  const [loading, setLoading] = useState(true);
  const [databases, setDatabases] = useState<Db[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [tablesLoading, setTablesLoading] = useState(false);

  const currentDatabase =
    databases && databases.length > 0 ? databases[0] : null;

  useEffect(() => {
    fetchTables();
  }, [currentDatabase]);

  async function fetchTables() {
    setTablesLoading(true);
    if (currentDatabase) {
      const { rows } = await queryProjectDb(
        currentDatabase,
        `SELECT table_name FROM information_schema.tables WHERE table_type='BASE TABLE' AND table_schema='public';`
      );
      setTables(rows.map((r: any) => r));
      setTablesLoading(false);
    }
  }

  async function fetchDatabases() {
    setLoading(true);
    const result = await fetch(
      `${SERVER_URL}/api/projects/${project.id}/databases`
    );
    const json = await result.json();
    setDatabases(json.databases);
    setLoading(false);
  }

  async function provisionDatabase() {
    setLoading(true);
    const result = await fetch(
      `${SERVER_URL}/api/projects/${project.id}/databases`,
      {
        method: "POST",
        body: JSON.stringify({
          name: `project_${project.id}_db`,
        }),
      }
    );
    const json = await result.json();
    await fetchDatabases();
  }

  useEffect(() => {
    fetchDatabases();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 bg-slate-50 flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  if (!currentDatabase) {
    return (
      <div className="flex-1 min-h-0 overflow-auto bg-slate-50">
        <div className="w-full h-full flex justify-center items-center">
          <div className="text-center text-slate-600">
            Database functionality is currently disabled for this project.
            <div className="font-semibold text-center">
              If you'd like to enable it, click the button below.
            </div>
            <div className="flex justify-center mt-4">
              <Button onClick={provisionDatabase}>Provision Database</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-row overflow-auto bg-slate-50">
      <div className={"w-56 border-r"}>
        {tablesLoading ? (
          <div className="w-full h-full flex justify-center items-center">
            <Loader />
          </div>
        ) : (
          <TablesList
            tables={tables}
            onSelectTable={(table) => setSelectedTable(table)}
            selectedTable={selectedTable}
            onTablesUpdates={fetchTables}
            database={currentDatabase}
          />
        )}
      </div>
      <div className={"flex-1"}></div>
    </div>
  );
}

export default ProjectDataEditor;
