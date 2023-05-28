import { Client } from "@/util/storage";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const client = new Client({ cookies });
  return NextResponse.json({
    project: await client.getProject(parseInt(params.projectId)),
  });
}
