import {
  generateDataGenerationQuery,
  generateQueryForComponent,
  generateTableCreationQuery,
} from "@/util/prompting";
import { Client } from "@/util/storage";
import { RequestCookies } from "@edge-runtime/cookies";

export const runtime = "edge";

export async function POST(request: Request) {
  const encoder = new TextEncoder();
  const reqCookies = new RequestCookies(request.headers);
  const client = new Client({
    cookies: () => reqCookies,
  });

  const customReadable = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode("\n"));

        const reqBody = await request.json();

        let query;

        switch (reqBody.type) {
          case "table":
            query = await generateTableCreationQuery(
              reqBody.name,
              reqBody.description,
              (_token) => {
                controller.enqueue(encoder.encode("\n"));
              }
            );
            break;
          case "data_generation":
            query = await generateDataGenerationQuery(
              reqBody.name,
              reqBody.schema,
              reqBody.description,
              (_token) => {
                controller.enqueue(encoder.encode("\n"));
              }
            );
            break;
          case "component_data_fetching":
            query = await generateQueryForComponent(
              await client.getFile(reqBody.projectId!, reqBody.filePath!),
              reqBody.tables!,
              reqBody.queryName!
            );
            break;
        }

        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              status: "ok",
              query,
            })
          )
        );
      } catch (e) {
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
