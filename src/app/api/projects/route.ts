import { generateRoot } from "@/util/prompting";
import { getProject, getProjectId, setProject } from "@/util/storage";
import { NextResponse } from "next/server";

const mockProject = {
  name: "test",
  files: {
    index: `<div><Text>hello world</Text></div>`,
    Text: `<div className="text-green-600">{children}</div>`,
  },
};

export async function POST(request: Request) {
  const { description, name } = await request.json();

  await generateRoot(description);

  return NextResponse.json({
    status: "ok",
  });

  // const id = getProjectId();
  // setProject(`${id}`, { ...mockProject, id: `${id}` });
  // return NextResponse.json({
  //   status: "ok",
  //   id,
  // });
}
