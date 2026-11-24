import type { MasterData, RequestData, ValidationResult } from "../types/index.js";

export function validateRequest(
  request: RequestData,
  master: MasterData | null
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!master) {
    errors.push("No existe registro maestro disponible");
    return { valid: false, errors, warnings };
  }

  if (!request.date) {
    errors.push("Falta la fecha de solicitud");
  }

  if (!request.format) {
    warnings.push("La solicitud no especifica formato");
  }

  if (!request.body?.trim()) {
    warnings.push("La solicitud no contiene cuerpo de mensaje");
  }

  if (!request.attachments) {
    warnings.push("La solicitud no declara adjuntos");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}