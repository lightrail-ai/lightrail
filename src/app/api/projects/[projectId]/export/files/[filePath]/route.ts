import { Client, File, FileStateItem } from "@/util/storage";
import { getInitialStateValueString } from "@/util/util";
import { cookies } from "next/headers";

function createExportComponent(file: File) {
  const componentImports = Array.from(
    new Set(
      Array.from(file.contents!.matchAll(/\<([A-Z]\w+)/g)).map((m) => m[1])
    )
  );

  const stateDeclarations = file.state
    ? (file.state as unknown as FileStateItem[])
        .map(
          (s) =>
            `const [${s.name}, ${
              "set" + s.name.charAt(0).toUpperCase() + s.name.slice(1)
            }] = React.useState(${getInitialStateValueString(s.initial)});`
        )
        .join("\n")
    : "";

  return `import React from "react";

${componentImports
  .map((comp) => `import ${comp} from "@/components/${comp}";`)
  .join("\n")}

export default function ${file.path}(props) {
    ${stateDeclarations}
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
