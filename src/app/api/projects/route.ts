import { generateComponent, generateRoot } from "@/util/prompting";
import { Client, File } from "@/util/storage";
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
      try {
        controller.enqueue(encoder.encode("\n"));

        const { description, name, type, libraries, props } =
          await request.json();

        let files: File[];

        if (type === "component") {
          let mainFile = await generateComponent(
            name,
            props,
            description,
            (_token) => {
              controller.enqueue(encoder.encode("\n"));
            }
          );

          const indexFile = mainFile.example
            ? {
                path: "index",
                contents: `<div className="w-full h-full flex items-center justify-center">${mainFile.example}</div>`,
              }
            : {
                path: "index",
                contents: `<div className="w-full h-full flex items-center justify-center"><${name} ${props
                  .map((p: string) => `${p}={undefined}`)
                  .join(" ")} /></div>`,
              };

          files = [indexFile, mainFile] as File[];
        } else {
          files = await generateRoot(name, description, libraries, (_token) => {
            controller.enqueue(encoder.encode("\n"));
          });
        }

        const project_id = await client.createProject(
          name,
          description,
          type,
          libraries
        );

        for (const file of files) {
          await client.createFile({
            ...file,
            project_id,
          });
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
      } catch (e: any) {
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              status: "error",
              error: e,
            })
          )
        );
        controller.close();
      }
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
