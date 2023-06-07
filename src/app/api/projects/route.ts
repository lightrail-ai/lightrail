import { generateRoot } from "@/util/prompting";
import { Client } from "@/util/storage";
import { NextResponse } from "next/server";
import { RequestCookies } from "@edge-runtime/cookies";

export const runtime = "edge";

export async function POST(request: Request) {
  const reqCookies = new RequestCookies(request.headers);
  const client = new Client({
    cookies: () => reqCookies,
  });

  const encoder = new TextEncoder();
  const customReadable = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode("\n"));

      const { description, name } = await request.json();

      const files = await generateRoot(description, (_token) => {
        controller.enqueue(encoder.encode("\n"));
      });

      const project_id = await client.createProject(name);

      for (const file of files) {
        await client.createFile(project_id, file.path, file.contents || "");
      }

      controller.enqueue(
        encoder.encode(
          JSON.stringify({
            status: "ok",
            id: project_id,
          })
        )
      );

      controller.close();
    },
  });

  return new Response(customReadable, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export async function GET(request: Request) {
  const reqCookies = new RequestCookies(request.headers);
  const client = new Client({
    cookies: () => reqCookies,
  });

  const projects = await client.getUserProjects();

  return NextResponse.json({
    projects,
  });
}
