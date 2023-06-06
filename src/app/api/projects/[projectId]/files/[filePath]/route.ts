import { Client } from "@/util/storage";
import { SERVER_URL } from "@/util/constants";
import { cookies } from "next/headers";

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
        return (<ComponentPreviewWrapper name="${name}">
            ${jsx}
        </ComponentPreviewWrapper>);
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
        return <></>;
      }
  
      export default function Component(props) {
          return (<ComponentPreviewWrapper name="${name}">
              <ErrorComponent />
          </ComponentPreviewWrapper>);
      } `;
}

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; filePath: string } }
) {
  const { searchParams } = new URL(request.url);
  const r = searchParams.get("r") ?? "0"; // For cache busting
  const client = new Client({ cookies });

  const Babel: any = await import(
    // @ts-ignore
    "node_modules/@babel/standalone/babel.min.js"
  );

  console.log(params);

  const contents = createPreviewComponent(
    params.projectId,
    params.filePath,
    await client.getFile(parseInt(params.projectId), params.filePath),
    r
  );

  let transpiled;

  try {
    transpiled = Babel.transform(contents, {
      presets: ["react"],
    });
  } catch (e: any) {
    console.error(e);
    const shortError = e.message.split("\n")[0];
    transpiled = Babel.transform(
      createErrorPreviewComponent(params.filePath, shortError),
      {
        presets: ["react"],
      }
    );
  }

  if (!transpiled) {
    return new Response("Error", { status: 500 });
  }

  return new Response(transpiled.code, {
    headers: {
      "Content-Type": "text/javascript",
    },
  });
}
