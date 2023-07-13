import {
  Client,
  File,
  FileExternalItem,
  FileQueryItem,
  FileStateItem,
  FileUpdate,
} from "@/util/storage";
import { SERVER_URL } from "@/util/constants";
import { cookies } from "next/headers";
import * as buble from "buble";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Theme, renderStarterComponentWithTheme } from "@/util/theming";
import { COMPLETE_LIBRARY } from "@/util/starter-library";
import { getInitialStateValueString, getUsedComponentNames } from "@/util/util";

function createPreviewComponent(
  projectId: string,
  file: File,
  queryString: string
) {
  const externalImports = file.externals
    ? (file.externals as unknown as FileExternalItem[])
        .map((e) => {
          const nameParts = [];
          if (e.default) nameParts.push(e.default);
          if (e.names) nameParts.push(`{${e.names.join(", ")}}`);
          return `import ${nameParts.join(", ")} from "${e.from}";`;
        })
        .join("\n")
    : "";

  const componentImports = getUsedComponentNames(
    file.contents!,
    file.externals
      ? (file.externals as unknown as FileExternalItem[])
      : undefined
  )
    .map(
      (comp) =>
        `const ${comp} = React.lazy(() => import("${SERVER_URL}/api/projects/${projectId}/files/${comp}?${queryString}"));`
    )
    .join("\n");

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

  const queries = file.queries
    ? (file.queries as unknown as FileQueryItem[])
    : null;

  const queryStatements =
    queries && queries.length > 0
      ? `
            const [lightrailQueriesFinished, setlightrailQueriesFinished] = React.useState(false);
            ${queries
              .map(
                (q) =>
                  `const [${q.name}, ${
                    "set" + q.name.charAt(0).toUpperCase() + q.name.slice(1)
                  }] = React.useState([]);`
              )
              .join("\n")}

            React.useEffect(() => {
              Promise.all([${queries
                .map(
                  (q) =>
                    `queryProjectDb({project_id: ${projectId}}, \`${q.query}\`)`
                )
                .join(", ")}]).then((results) => {${queries
          .map(
            (q, i) =>
              `set${
                q.name.charAt(0).toUpperCase() + q.name.slice(1)
              }(results[${i}].rows);`
          )
          .join("\n")}
                setlightrailQueriesFinished(true);});
            }, []);
  `
      : "";

  return `
    import React from "@lightrail/react";
    import ComponentPreviewWrapper from "@lightrail/ComponentPreviewWrapper"
    import queryProjectDb from "@lightrail/queryProjectDb"

    ${externalImports}

    ${componentImports}

    export default function Component(props) {
        ${stateDeclarations}

        ${queryStatements}

        return ${
          buble.transform(
            `<ComponentPreviewWrapper name="${file.path}">
            ${file.contents!}
        </ComponentPreviewWrapper>`,
            {
              objectAssign: "Object.assign",
              target: { chrome: 71 },
            }
          ).code
        };
    } `;
}

function createErrorPreviewComponent(name: string, error: any) {
  return `
      import React from "@lightrail/react";
      import ComponentPreviewWrapper from "@lightrail/ComponentPreviewWrapper"

      const ErrorComponent = () => {
        React.useEffect(() => {
          throw new Error(${JSON.stringify(error.message)}, ${JSON.stringify({
    cause: error.snippet,
  })});
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

  if (params.projectId == "themes") {
    // special theme-testing project, viewable at '/themes'

    const file = (
      await renderStarterComponentWithTheme(
        COMPLETE_LIBRARY.find((c) => c.name === params.filePath)!,
        Object.fromEntries(searchParams.entries())
      )
    ).find((f) => f.path === params.filePath)!;
    const contents = createPreviewComponent(
      params.projectId,
      { ...file, externals: file.externals || null } as File,
      searchParams.toString()
    );
    return new Response(contents, {
      headers: {
        "Content-Type": "text/javascript",
      },
    });
  }

  const client = new Client({
    cookies,
  });

  console.log(params);

  let contents;

  try {
    contents = createPreviewComponent(
      params.projectId,
      await client.getFile(parseInt(params.projectId), params.filePath),
      searchParams.toString()
    );
  } catch (e: any) {
    console.error(e);
    contents = createErrorPreviewComponent(params.filePath, e);
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

export async function PUT(
  request: Request,
  { params }: { params: { projectId: string; filePath: string } }
) {
  const client = new Client({
    cookies,
  });

  const json = await request.json();

  let update: FileUpdate;

  if ("revision" in json) {
    const revisionContent = await client.getRevision(parseInt(json.revision));

    update = Object.assign({}, revisionContent);
    delete update.id;
    delete update.created_at;
    delete update.project_id;
    delete update.path;
    delete update.owner;
  } else {
    update = json;
  }

  await client.updateFile(parseInt(params.projectId), params.filePath, update);
  revalidatePath(`/api/projects/${params.projectId}/files/${params.filePath}`);
  revalidatePath(`/api/projects/${params.projectId}`);

  return NextResponse.json({ status: "ok" });
}

export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string; filePath: string } }
) {
  const client = new Client({
    cookies,
  });

  await client.deleteFile(parseInt(params.projectId), params.filePath);
  revalidatePath(`/api/projects/${params.projectId}/files/${params.filePath}`);
  revalidatePath(`/api/projects/${params.projectId}`);

  return NextResponse.json({ status: "ok" });
}
