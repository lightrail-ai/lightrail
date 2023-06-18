import { Client } from "@/util/storage";
import * as prompting from "@/util/prompting";
import { revalidatePath } from "next/cache";
import { RequestCookies } from "@edge-runtime/cookies";

export const runtime = "edge";

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const reqCookies = new RequestCookies(request.headers);
  const client = new Client({
    cookies: () => reqCookies,
  });

  const { name, props, description } = await request.json();
  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode("\n"));

        const file = await prompting.generateComponent(
          name,
          props,
          description,
          (_token) => {
            controller.enqueue(encoder.encode("\n"));
          }
        );

        await client.createFile(
          parseInt(params.projectId),
          file.path,
          file.contents || "",
          file.state
        );

        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              status: "ok",
              message: "Component created!",
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
