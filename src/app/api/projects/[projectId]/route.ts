import { getProject, projects } from "@/util/storage";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  return NextResponse.json({
    project: getProject(params.projectId),
  });
}
