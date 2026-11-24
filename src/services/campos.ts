import { readFile } from "node:fs/promises";

export type Glossary = Record<string, string>;

export interface ResolvedField {
  etiqueta: string;
  path: string;
  value: unknown;
}

export async function loadGlossary(
  glossaryPath: string
): Promise<Glossary> {
  const content = await readFile(glossaryPath, "utf8");
  return JSON.parse(content) as Glossary;
}

export function getValueByPath(
  source: unknown,
  path: string
): unknown {
  let current: unknown = source;

  for (const segment of path.split(".")) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

export function resolveField(
  etiqueta: string,
  glossary: Glossary,
  source: unknown
): ResolvedField | null {
  const path = glossary[etiqueta];

  if (!path) {
    return null;
  }

  return {
    etiqueta,
    path,
    value: getValueByPath(source, path)
  };
}

export function resolveFields(
  labels: string[],
  glossary: Glossary,
  source: unknown
): ResolvedField[] {
  return labels
    .map((label) => resolveField(label, glossary, source))
    .filter(
      (field): field is ResolvedField =>
        field !== null
    );
}