import { Client } from "@/util/storage";
import { SERVER_URL } from "@/util/constants";
import { cookies } from "next/headers";
import * as buble from "buble";

function createPreviewComponent(
  projectId: string,
  name: string,
  jsx: string,
  r: string
) {
  const componentImports = Array.from(
    new Set(Array.from(jsx.matchAll(/\<([A-Z]\w+)/g)).map((m) => m[1]))
  );

  return `
    import React from "@lightwand/react";
    import ComponentPreviewWrapper from "@lightwand/ComponentPreviewWrapper"

    ${componentImports
      .map(
        (comp) =>
          `const ${comp} = React.lazy(() => import("${SERVER_URL}/api/projects/${projectId}/files/${comp}?r=${r}").catch(e => console.log(e)));`
      )
      .join("\n")}

    export default function Component(props) {
        return ${
          buble.transform(`<ComponentPreviewWrapper name="${name}">
            ${jsx}
        </ComponentPreviewWrapper>`).code
        };
    } `;
}

function createErrorPreviewComponent(name: string, error: string) {
  return `
      import React from "@lightwand/react";
      import ComponentPreviewWrapper from "@lightwand/ComponentPreviewWrapper"

      const ErrorComponent = () => {
        React.useEffect(() => {
          throw new Error("${error}");
        }, [])
        return React.createElement( React.Fragment, null );
      }
  
      export default function Component(props) {
          return React.createElement(ComponentPreviewWrapper, { name: "${name}" },
            React.createElement( ErrorComponent, null )
          );
      } `;
}

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; filePath: string } }
) {
  const { searchParams } = new URL(request.url);
  const r = searchParams.get("r") ?? "0"; // For cache busting

  const client = new Client({
    cookies,
  });

  console.log(params);

  let contents;

  try {
    contents = createPreviewComponent(
      params.projectId,
      params.filePath,
      await client.getFile(parseInt(params.projectId), params.filePath),
      r
    );
  } catch (e: any) {
    console.error(e);
    const shortError = e.message.split("\n")[0];
    contents = createErrorPreviewComponent(params.filePath, shortError);
  }

  if (!contents) {
    return new Response("Error", { status: 500 });
  }

  return new Response(contents, {
    headers: {
      "Content-Type": "text/javascript",
    },
  });
}
