import { SERVER_URL } from "./constants";
import {
  COMPLETE_LIBRARY,
  StarterComponentDescription,
} from "./starter-library";
import { File, FileDescription, NewFile } from "./storage";
import { getUsedComponentNames } from "./util";

export const STYLES = {
  juniper: "A modern, clean style with a lot of empty space.", // Default
  pine: "A high-contrast tech-ish style.",
  holly: "A dark, sleek style.",
};

export interface Theme {
  style?: keyof typeof STYLES;
  scheme?: "dark" | "light";
  font?: "sans-serif" | "serif";
}

export function getApplicableVariant(
  starter: StarterComponentDescription,
  theme: Theme
) {
  const variant = starter.variants.find((v) => {
    if (v.for === undefined) {
      return true;
    }
    return (
      v.for.includes(`style:${theme.style}`) ||
      v.for.includes(`scheme:${theme.scheme}`)
    );
  });
  if (!variant) {
    throw new Error(`No variant found for theme ${JSON.stringify(theme)}`);
  }
  return variant;
}

export async function renderStarterComponentWithTheme(
  starter: StarterComponentDescription,
  theme: Theme
): Promise<FileDescription[]> {
  const variant = getApplicableVariant(starter, theme);
  if (!variant.src) {
    return [];
  }

  const resp = await fetch(
    SERVER_URL +
      "/api/templates/" +
      variant.src +
      "?" +
      new URLSearchParams(theme as any).toString()
  );
  const contents = await resp.text();

  const dependencyNames = getUsedComponentNames(contents, starter.externals);

  let dependencyFileDescriptions: FileDescription[] = [];
  for (const dep of dependencyNames) {
    const depDescriptions = await renderStarterComponentWithTheme(
      COMPLETE_LIBRARY.find((c) => c.name === dep)!,
      theme
    );
    dependencyFileDescriptions =
      dependencyFileDescriptions.concat(depDescriptions);
  }

  const output = [
    {
      path: starter.name,
      contents: contents,
      externals: starter.externals,
    },
    ...dependencyFileDescriptions,
  ];

  return output;
}
