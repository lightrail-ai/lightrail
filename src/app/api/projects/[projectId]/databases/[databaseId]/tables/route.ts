import { Table } from "@/components/ProjectEditor/editor-types";
import { Client } from "@/util/storage";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Client as PGClient } from "pg";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; databaseId: string } }
) {
  const client = new Client({ cookies });

  const database = await client.getDatabase(parseInt(params.databaseId));

  const pgclient = new PGClient({
    ssl: true,
    connectionString: `postgres://${process.env.NEON_DEFAULT_ROLE}:${process.env.NEON_DEFAULT_ROLE_PASSWORD}@${process.env.NEON_ACCESS_ENDPOINT}/${database.name}`,
  });

  await pgclient.connect();
  const result = await pgclient.query(`
    SELECT information_schema.tables.table_name, column_name, data_type, is_nullable, column_default 
    FROM information_schema.columns 
    JOIN information_schema.tables 
    ON information_schema.columns.table_name=information_schema.tables.table_name
    WHERE table_type='BASE TABLE' AND information_schema.tables.table_schema='public';
  `);
  await pgclient.end();

  const tables: Table[] = Object.values(
    result.rows.reduce((acc: { [k: string]: Table }, row: any) => {
      if (row.table_name in acc) {
        acc[row.table_name].columns.push(row);
      } else {
        acc[row.table_name] = {
          table_name: row.table_name,
          columns: [row],
        };
      }
      return acc;
    }, {})
  );

  console.log(tables);

  return NextResponse.json({
    tables,
  });
}
