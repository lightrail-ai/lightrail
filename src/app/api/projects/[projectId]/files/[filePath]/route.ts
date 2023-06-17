import { Client, File, FileStateItem } from "@/util/storage";
import { SERVER_URL } from "@/util/constants";
import { cookies } from "next/headers";
import * as buble from "buble";

function createPreviewComponent(projectId: string, file: File, r: string) {
  const componentImports = Array.from(
    new Set(
      Array.from(file.contents!.matchAll(/\<([A-Z]\w+)/g)).map((m) => m[1])
    )
  )
    .map(
      (comp) =>
        `const ${comp} = React.lazy(() => import("${SERVER_URL}/api/projects/${projectId}/files/${comp}?r=${r}").catch(e => console.log(e)));`
    )
    .join("\n");

  const stateDeclarations = file.state
    ? (file.state as unknown as FileStateItem[])
        .map(
          (s) =>
            `const [${s.name}, ${
              "set" + s.name.charAt(0).toUpperCase() + s.name.slice(1)
            }] = React.useState(${s.initial});`
        )
        .join("\n")
    : "";

  return `
    import React from "@lightrail/react";
    import ComponentPreviewWrapper from "@lightrail/ComponentPreviewWrapper"

    ${componentImports}

    export default function Component(props) {
        ${stateDeclarations}

        return ${
          buble.transform(`<ComponentPreviewWrapper name="${file.path}">
            ${file.contents!}
        </ComponentPreviewWrapper>`).code
        };
    } `;
}

function createErrorPreviewComponent(name: string, error: string) {
  return `
      import React from "@lightrail/react";
      import ComponentPreviewWrapper from "@lightrail/ComponentPreviewWrapper"

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
