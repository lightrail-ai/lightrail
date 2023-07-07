import prettier from "prettier/standalone";
import prettierBabelParser from "prettier/parser-babel";
import { Db, FileExternalItem } from "./storage";
import { SERVER_URL } from "./constants";

export function sanitizeComponentName(name: string) {
  let sanitized = name.replaceAll(/\s/g, "");
  sanitized = sanitized.charAt(0).toUpperCase() + sanitized.slice(1);
  return sanitized;
}

export function sanitizeVariableName(name: string) {
  let sanitized = name.replaceAll(/\s/g, "");
  sanitized = sanitized.charAt(0).toLowerCase() + sanitized.slice(1);
  return sanitized;
}

export function getInitialStateValueString(value: any) {
  if (value === null) {
    return "null";
  }
  if (value === undefined) {
    return "undefined";
  }
  if (!isNaN(value)) {
    return value;
  }

  if (typeof value === "string") {
    if (["true", "false", "null", "undefined"].includes(value)) {
      return value;
    }
    if (value.startsWith("{") || value.startsWith("[")) {
      return value;
    }
    if (value.startsWith('"') || value.startsWith("'")) {
      return value;
    }
    if (value.match(/^\d+$/)) {
      return value;
    }
  }

  return JSON.stringify(value);
}

export function getUsedComponentNames(
  jsx: string,
  externals?: FileExternalItem[]
) {
  const externalNames = new Set();
  if (externals) {
    for (const external of externals) {
      if (external.default) externalNames.add(external.default);
      if (external.names) external.names.forEach((n) => externalNames.add(n));
    }
  }

  return Array.from(
    new Set(
      Array.from(jsx.matchAll(/\<([A-Z]\w+)/g))
        .map((m) => m[1])
        .filter((n) => !externalNames.has(n))
    )
  );
}

export function formatComponentTree(code: string) {
  let formatted;
  try {
    formatted = prettier
      .format(code, {
        parser: "babel",
        semi: false,
        plugins: [prettierBabelParser],
      })
      .replace(/^;+|;+$/g, "");
  } catch (e) {
    console.error(e);
    formatted = code;
  }

  return formatted;
}

export async function queryProjectDb(
  db: Db | { project_id: number },
  query: string
): Promise<{ rows: any[]; fields: any[] }> {
  const result = await fetch(
    `${SERVER_URL}/api/projects/${db.project_id}/databases/${
      "id" in db ? db.id : "default"
    }/contents`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }
  );
  const json = await result.json();
  return json;
}
