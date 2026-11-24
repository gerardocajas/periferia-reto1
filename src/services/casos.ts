import path from "node:path";
import { readFile } from "node:fs/promises";

import type { RequestData } from "../types/index.js";
import { MasterRepository } from "./repository.js";
import { validateRequest } from "./validator.js";
import { loadGlossary } from "./campos.js";
import { loadTemplate } from "./plantillas.js";
import {
  resolveCellTemplate,
  resolveGenericTemplate,
  validateResolvedFields,
} from "./plantillas.js";
import { consultarSoportes } from "../tools/soportes.js";
import { parseFixtureRequest } from "./request-parser.js";

export type CaseStatus =
  | "READY"
  | "REVIEW_REQUIRED"
  | "INVALID";

export interface ProcessCaseResult {
  caseId: string;
  format: RequestData["format"];
  requestValid: boolean;
  supportValid: boolean;
  fieldsValid: boolean;
  status: CaseStatus;
  missingOptionalFields: string[];
  missingRequiredFields: string[];
  missingSupports: string[];
  expiredSupports: string[];
  reasons: string[];
}

export async function processCase(
  caseId: string,
  fixtureRoot: string,
  repository: MasterRepository,
): Promise<ProcessCaseResult> {
  const caseRoot = path.join(fixtureRoot, "casos", caseId);

  const rawRequest = JSON.parse(
    await readFile(
      path.join(caseRoot, "solicitud.json"),
      "utf8",
    ),
  );

  const request = parseFixtureRequest(rawRequest);

  const requestValidation = validateRequest(
    request,
    repository.getMaster(),
  );

  const supportRequirements = JSON.parse(
    await readFile(
      path.join(caseRoot, "soportes-exigidos.json"),
      "utf8",
    ),
  ) as string[];

  const supportValidation = await consultarSoportes(
    {
      fechaSolicitud: request.date!,
      pais: repository.getMaster().pais,
      requeridos: supportRequirements,
    },
    path.join(
      fixtureRoot,
      "repositorio",
      "soportes",
      "index.json",
    ),
  );

  const glossary = await loadGlossary(
    path.join(fixtureRoot, "glosario-campos.json"),
  );

  let templateFile: "plantilla-celdas.json" | "plantilla-campos.json";

  try {
    await readFile(
      path.join(caseRoot, "plantilla-celdas.json"),
      "utf8",
    );

    templateFile = "plantilla-celdas.json";
  } catch {
    templateFile = "plantilla-campos.json";
  }

  const rawTemplate = await loadTemplate(
    path.join(caseRoot, templateFile),
  );

  const fields =
    templateFile === "plantilla-celdas.json"
      ? resolveCellTemplate(
          rawTemplate,
          glossary,
          repository.getMaster(),
        )
      : resolveGenericTemplate(
          rawTemplate,
          glossary,
          repository.getMaster(),
        );

  const fieldValidation = validateResolvedFields(fields);

  const reasons: string[] = [];

  if (!requestValidation.valid) {
    reasons.push(...requestValidation.errors);
  }

  if (!supportValidation.valid) {
    reasons.push(
      ...supportValidation.missing.map(
        (item) => `Falta soporte requerido: ${item}`,
      ),
    );

    reasons.push(
      ...supportValidation.expired.map(
        (item) => `Soporte vencido: ${item}`,
      ),
    );

    reasons.push(...supportValidation.errors);
  }

  if (!fieldValidation.valid) {
    reasons.push(
      ...fieldValidation.missingRequired.map(
        (item) => `Campo requerido no resuelto: ${item}`,
      ),
    );
  }

  const status: CaseStatus =
    !requestValidation.valid
      ? "INVALID"
      : requestValidation.valid &&
          supportValidation.valid &&
          fieldValidation.valid
        ? "READY"
        : "REVIEW_REQUIRED";

  return {
    caseId,
    format: request.format,
    requestValid: requestValidation.valid,
    supportValid: supportValidation.valid,
    fieldsValid: fieldValidation.valid,
    status,
    missingOptionalFields: fieldValidation.missingOptional,
    missingRequiredFields: fieldValidation.missingRequired,
    missingSupports: supportValidation.missing,
    expiredSupports: supportValidation.expired,
    reasons,
  };
}