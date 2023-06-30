import { Client, FileUpdate } from "@/util/storage";
import * as prompting from "@/util/prompting";
import { RequestCookies } from "@edge-runtime/cookies";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(
  request: Request,
  { params }: { params: { projectId: string; filePath: string } }
) {
  const reqCookies = new RequestCookies(request.headers);
  const client = new Client({
    cookies: () => reqCookies,
  });

  const { modification, error } = await request.json();
  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode("\n"));
        const old = await client.getFile(
          parseInt(params.projectId),
          params.filePath
        );

        let update: FileUpdate = {};
        let explanation = "";

        if (error) {
          const mod = await prompting.modifyComponentWithCompletion(
            old.contents!,
            `The JSX currently fails to render with the error: '${error}'. Fix the JSX so that it renders properly.`,
            (_token) => {
              controller.enqueue(encoder.encode("\n"));
            }
          );

          explanation = mod.explanation;
          update = {
            contents: mod.jsx,
          };
        } else if (modification) {
          ({ update, explanation } = await prompting.modifyComponent(
            old,
            modification,
            (_token) => {
              controller.enqueue(encoder.encode("\n"));
            }
          ));
        } else {
          throw new Error("No modification or error provided");
        }

        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              status: "ok",
              message: explanation,
              update: update,
            })
          )
        );
      } catch (e: any) {
        console.error(e);
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              status: "error",
              error: e,
            })
          )
        );
      } finally {
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

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; filePath: string } }
) {
  const reqCookies = new RequestCookies(request.headers);
  const client = new Client({
    cookies: () => reqCookies,
  });

  const revisions = await client.getRevisions(
    parseInt(params.projectId),
    params.filePath
  );

  return NextResponse.json({
    revisions,
  });
}
