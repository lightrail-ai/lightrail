import { getProject } from "@/util/storage";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  return NextResponse.json({
    project: await getProject(parseInt(params.projectId)),
  });
}
