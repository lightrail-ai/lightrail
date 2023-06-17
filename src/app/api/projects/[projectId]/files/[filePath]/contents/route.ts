import { Client } from "@/util/storage";
import * as prompting from "@/util/prompting";
import { revalidatePath } from "next/cache";
import { RequestCookies } from "@edge-runtime/cookies";

export const runtime = "edge";

export async function PUT(
  request: Request,
  { params }: { params: { projectId: string; filePath: string } }
) {
  const reqCookies = new RequestCookies(request.headers);
  const client = new Client({
    cookies: () => reqCookies,
  });

  const { modification, contents, error } = await request.json();
  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode("\n"));

        if (error) {
          const old = await client.getFile(
            parseInt(params.projectId),
            params.filePath
          );

          const { jsx, explanation } =
            await prompting.modifyComponentWithCompletion(
              old.contents!,
              `The JSX currently fails to render with the error: '${error}'. Fix the JSX so that it renders properly.`,
              (_token) => {
                controller.enqueue(encoder.encode("\n"));
              }
            );

          await client.updateFile(
            parseInt(params.projectId),
            params.filePath,
            jsx
          );

          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                status: "ok",
                message: explanation,
              })
            )
          );
        } else if (!modification && contents) {
          await client.updateFile(
            parseInt(params.projectId),
            params.filePath,
            contents
          );

          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                status: "ok",
                file: contents,
                message: "Component updated!",
              })
            )
          );
        } else {
          const old = await client.getFile(
            parseInt(params.projectId),
            params.filePath
          );

          const { jsx, explanation } = await prompting.modifyComponent(
            old.contents!,
            modification,
            (_token) => {
              controller.enqueue(encoder.encode("\n"));
            }
          );
          const newFile = jsx;
          await client.updateFile(
            parseInt(params.projectId),
            params.filePath,
            newFile!
          );
          revalidatePath(
            `/api/projects/${params.projectId}/files/${params.filePath}`
          );
          revalidatePath(`/api/projects/${params.projectId}`);

          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                status: "ok",
                file: newFile,
                message: explanation,
              })
            )
          );
        }

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
