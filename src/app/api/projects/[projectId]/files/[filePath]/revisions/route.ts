import { Client } from "@/util/storage";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; filePath: string } }
) {
  const client = new Client({
    cookies,
  });

  const revisions = await client.getRevisions(
    parseInt(params.projectId),
    params.filePath
  );

  return NextResponse.json({
    revisions,
  });
}
