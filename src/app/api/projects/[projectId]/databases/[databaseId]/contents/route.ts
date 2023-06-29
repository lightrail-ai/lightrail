import { Client } from "@/util/storage";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Client as PGClient } from "pg";

export async function PUT(
  request: Request,
  { params }: { params: { projectId: string; databaseId: string } }
) {
  const client = new Client({ cookies });
  const { query } = await request.json();

  let database;

  if (params.databaseId === "default") {
    database = await client.getDefaultDatabase(parseInt(params.projectId));
  } else {
    database = await client.getDatabase(parseInt(params.databaseId));
  }

  const pgclient = new PGClient({
    ssl: true,
    connectionString: `postgres://${process.env.NEON_DEFAULT_ROLE}:${process.env.NEON_DEFAULT_ROLE_PASSWORD}@${process.env.NEON_ACCESS_ENDPOINT}/${database.name}`,
  });

  await pgclient.connect();
  const result = await pgclient.query(query);
  await pgclient.end();

  return NextResponse.json({
    rows: result.rows,
    fields: result.fields,
  });
}
