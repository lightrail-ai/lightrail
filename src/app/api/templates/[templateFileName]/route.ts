import path from "path";
import { promises as fs } from "fs";

export async function GET(
  request: Request,
  { params }: { params: { templateFileName: string } }
) {
  const { searchParams } = new URL(request.url);
  const theme = Object.fromEntries(searchParams.entries());

  const templatesDirectory = path.join(process.cwd(), "templates");
  let fileContents = await fs.readFile(
    path.join(templatesDirectory, params.templateFileName),
    "utf8"
  );

  fileContents = fileContents.replace(/{{{(.*)}}}/g, (match, p1) => {
    return new Function("theme", `"use strict"; return ${p1};`)(theme);
  });

  return new Response(fileContents, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
