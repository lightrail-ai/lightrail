import { Client, File } from "@/util/storage";
import { cookies } from "next/headers";

function createExportComponent(file: File) {
  const componentImports = Array.from(
    new Set(
      Array.from(file.contents!.matchAll(/\<([A-Z]\w+)/g)).map((m) => m[1])
    )
  );

  return `import React from "react";
${componentImports
  .map((comp) => `import ${comp} from "@/components/${comp}";`)
  .join("\n")}

export default function ${file.path}(props) {
    return (<>${file.contents!}</>);
} `;
}

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; filePath: string } }
) {
  const client = new Client({ cookies });

  const contents = createExportComponent(
    await client.getFile(parseInt(params.projectId), params.filePath)
  );

  return new Response(contents, {
    headers: {
      "Content-Type": "text/javascript",
    },
  });
}
