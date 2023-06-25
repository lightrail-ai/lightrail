import prettier from "prettier/standalone";
import prettierBabelParser from "prettier/parser-babel";
import { Db } from "./storage";
import { SERVER_URL } from "./constants";

export function sanitizeComponentName(name: string) {
  let sanitized = name.replaceAll(/\s/g, "");
  sanitized = sanitized.charAt(0).toUpperCase() + sanitized.slice(1);
  return sanitized;
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

export async function queryProjectDb(db: Db, query: string) {
  const result = await fetch(
    `${SERVER_URL}/api/projects/${db.project_id}/databases/${db.id}/contents`,
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
