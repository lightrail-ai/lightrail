import { generateTableCreationQuery } from "@/util/prompting";

export const runtime = "edge";

export async function POST(request: Request) {
  const encoder = new TextEncoder();
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
