import { getFile, setFile } from "@/util/storage";
import { SERVER_URL } from "@/util/constants";
import * as prompting from "@/util/prompting";
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

function createPreviewComponent(
  projectId: string,
  name: string,
  jsx: string,
  r: string
) {
  const componentImports = Array.from(jsx.matchAll(/\<([A-Z]\w+)/g)).map(
    (m) => m[1]
  );

  return `
    import React from "@halloumi/react";
    import ComponentPreviewWrapper from "@halloumi/ComponentPreviewWrapper"

    ${componentImports
      .map(
        (comp) =>
          `const ${comp} = React.lazy(() => import("${SERVER_URL}/api/projects/${projectId}/files/${comp}?r=${r}").catch(e => console.log(e)));`
      )
      .join("\n")}

    export default function Component({children}) {
        return (<ComponentPreviewWrapper name="${name}">
            ${jsx}
        </ComponentPreviewWrapper>);
    } `;
}

function createExportComponent(jsx: string) {
  return jsx;
}

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; filePath: string } }
) {
  const { searchParams } = new URL(request.url);
  const r = searchParams.get("r") ?? "0"; // For cache busting

  const Babel: any = await import(
    // @ts-ignore
    "node_modules/@babel/standalone/babel.min.js"
  );

  const contents = createPreviewComponent(
    params.projectId,
    params.filePath,
    getFile(params.projectId, params.filePath),
    r
  );

  const transpiled = Babel.transform(contents, {
    presets: ["react"],
  });

  if (!transpiled) {
    return new Response("Error", { status: 500 });
  }

  return new Response(transpiled.code, {
    headers: {
      "Content-Type": "text/javascript",
    },
  });
}

export async function PUT(
  request: Request,
  { params }: { params: { projectId: string; filePath: string } }
) {
  const { modification } = await request.json();
  const old = getFile(params.projectId, params.filePath);
  const { jsx, explanation } = await prompting.modifyComponent(
    old,
    modification
  );
  const newFile = jsx;
  setFile(params.projectId, params.filePath, newFile!);
  revalidatePath(`/api/projects/${params.projectId}/files/${params.filePath}`);
  revalidatePath(`/api/projects/${params.projectId}`);

  return NextResponse.json({
    status: "ok",
    file: newFile,
    message: explanation,
  });
}
