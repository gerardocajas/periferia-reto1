import { readFile } from "node:fs/promises";
import { z } from "zod";
import {
  getValueByPath,
  type Glossary
} from "./campos.js";

const CellTemplateFieldSchema = z.object({
  hoja: z.string().min(1),
  celda_etiqueta: z.string().min(1),
  etiqueta: z.string().min(1),
  celda_valor: z.string().regex(/^[A-Z]+[1-9][0-9]*$/)
});

const GenericTemplateFieldSchema = z.object({
  etiqueta: z.string().min(1),
  obligatorio: z.boolean()
});

export interface ResolvedTemplateField {
  etiqueta: string;
  obligatorio: boolean;
  path: string | null;
  valor: string | number | boolean | null;
  hoja?: string;
  celdaValor?: string;
  estado: "resolved" | "missing_glossary" | "missing_value";
}

export async function loadTemplate(
  templatePath: string
): Promise<unknown[]> {
  const content = await readFile(templatePath, "utf8");
  const parsed: unknown = JSON.parse(content);

  if (!Array.isArray(parsed)) {
    throw new Error(`La plantilla debe contener un arreglo: ${templatePath}`);
  }

  return parsed;
}

function normalizeValue(
  value: unknown
): string | number | boolean | null {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (value === null || value === undefined) {
    return null;
  }

  return JSON.stringify(value);
}

export function resolveCellTemplate(
  template: unknown[],
  glossary: Glossary,
  source: unknown
): ResolvedTemplateField[] {
  return template.map((rawField) => {
    const field = CellTemplateFieldSchema.parse(rawField);
    const path = glossary[field.etiqueta];

    if (!path) {
      return {
        etiqueta: field.etiqueta,
        obligatorio: true,
        path: null,
        valor: null,
        hoja: field.hoja,
        celdaValor: field.celda_valor,
        estado: "missing_glossary"
      };
    }

    const value = getValueByPath(source, path);

    if (value === undefined || value === null) {
      return {
        etiqueta: field.etiqueta,
        obligatorio: true,
        path,
        valor: null,
        hoja: field.hoja,
        celdaValor: field.celda_valor,
        estado: "missing_value"
      };
    }

    return {
      etiqueta: field.etiqueta,
      obligatorio: true,
      path,
      valor: normalizeValue(value),
      hoja: field.hoja,
      celdaValor: field.celda_valor,
      estado: "resolved"
    };
  });
}

export function resolveGenericTemplate(
  template: unknown[],
  glossary: Glossary,
  source: unknown
): ResolvedTemplateField[] {
  return template.map((rawField) => {
    const field = GenericTemplateFieldSchema.parse(rawField);
    const path = glossary[field.etiqueta];

    if (!path) {
      return {
        etiqueta: field.etiqueta,
        obligatorio: field.obligatorio,
        path: null,
        valor: null,
        estado: "missing_glossary"
      };
    }

    const value = getValueByPath(source, path);

    if (value === undefined || value === null) {
      return {
        etiqueta: field.etiqueta,
        obligatorio: field.obligatorio,
        path,
        valor: null,
        estado: "missing_value"
      };
    }

    return {
      etiqueta: field.etiqueta,
      obligatorio: field.obligatorio,
      path,
      valor: normalizeValue(value),
      estado: "resolved"
    };
  });
}

export function validateResolvedFields(
  fields: ResolvedTemplateField[]
): {
  valid: boolean;
  missingRequired: string[];
  missingOptional: string[];
  unresolved: ResolvedTemplateField[];
} {
  const missingRequired = fields
    .filter(
      (field) =>
        field.obligatorio &&
        field.estado !== "resolved"
    )
    .map((field) => field.etiqueta);

  const missingOptional = fields
    .filter(
      (field) =>
        !field.obligatorio &&
        field.estado !== "resolved"
    )
    .map((field) => field.etiqueta);

  return {
    valid: missingRequired.length === 0,
    missingRequired,
    missingOptional,
    unresolved: fields.filter(
      (field) => field.estado !== "resolved"
    )
  };
}