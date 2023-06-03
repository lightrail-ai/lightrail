import { Client } from "@/util/storage";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const client = new Client({ cookies });
  const files = (
    await client.getProjectFileNames(parseInt(params.projectId))
  ).filter((f) => f !== "index");

  return NextResponse.json({
    contents: [
      { name: "public", children: [] },
      {
        name: "src",
        children: [
          {
            name: "app",
            children: [
              {
                name: "favicon.ico",
                url: "/next-scaffold/src/app/favicon.ico",
              },
              {
                name: "globals.css",
                url: "/next-scaffold/src/app/globals.css",
              },
              { name: "layout.js", url: "/next-scaffold/src/app/layout.js" },
              {
                name: "page.js",
                url: `/api/projects/${params.projectId}/export/files/index`,
              },
            ],
          },
          {
            name: "components",
            children: files.map((f) => ({
              name: f + ".jsx",
              url: `/api/projects/${params.projectId}/export/files/${f}`,
            })),
          },
        ],
      },
      {
        name: ".gitignore",
        url: "/next-scaffold/.gitignore",
      },
      {
        name: "next.config.js",
        url: "/next-scaffold/next.config.js",
      },
      {
        name: "package.json",
        url: "/next-scaffold/package.json",
      },
      //   {
      //     name: "package-lock.json",
      //     url: "/next-scaffold/package.json",
      //   },
      {
        name: "README.md",
        url: "/next-scaffold/README.md",
      },
      {
        name: "jsconfig.json",
        url: "/next-scaffold/jsconfig.json",
      },
      {
        name: "postcss.config.js",
        url: "/next-scaffold/postcss.config.js",
      },
      {
        name: "tailwind.config.js",
        url: "/next-scaffold/tailwind.config.js",
      },
    ],
  });
}
