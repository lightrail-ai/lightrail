import { Client } from "@/util/storage";
import { cookies } from "next/headers";

function createExportComponent(name: string, jsx: string) {
  const componentImports = Array.from(
    new Set(Array.from(jsx.matchAll(/\<([A-Z]\w+)/g)).map((m) => m[1]))
  );

  return `import React from "react";
${componentImports
  .map((comp) => `import ${comp} from "@/components/${comp}";`)
  .join("\n")}

export default function ${name}(props) {
    return (<>${jsx}</>);
} `;
}

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; filePath: string } }
) {
  const client = new Client({ cookies });

  const contents = createExportComponent(
    params.filePath,
    await client.getFile(parseInt(params.projectId), params.filePath)
  );

  return new Response(contents, {
    headers: {
      "Content-Type": "text/javascript",
    },
  });
}
