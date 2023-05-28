import { generateRoot } from "@/util/prompting";
import { Client } from "@/util/storage";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const mockProject = {
  name: "test",
  files: {
    index: `<div><Text>hello world</Text></div>`,
    Text: `<div className="text-green-600">{children}</div>`,
  },
};

export async function POST(request: Request) {
  const client = new Client({ cookies });

  const { description, name } = await request.json();

  const files = await generateRoot(description);

  const project_id = await client.createProject(name);

  for (const file of files) {
    await client.createFile(project_id, file.path, file.contents || "");
  }

  return NextResponse.json({
    status: "ok",
  });
}
