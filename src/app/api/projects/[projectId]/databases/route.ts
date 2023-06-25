import { Client } from "@/util/storage";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import * as DBProvider from "@/util/db-provider-integration";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const client = new Client({ cookies });
  const databases = await client.getDatabases(parseInt(params.projectId));
  return NextResponse.json({ databases });
}

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const client = new Client({ cookies });
  const { name } = await request.json();
  const databaseDetails = await DBProvider.createDatabase(name);
  const result = await client.createDatabase({
    name: databaseDetails.name,
    project_id: parseInt(params.projectId),
  });

  return NextResponse.json({
    status: "ok",
  });
}
