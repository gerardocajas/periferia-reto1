import { readFile } from "node:fs/promises";
import { z } from "zod";
import type {
  SupportIndexEntry,
  SupportValidationResult
} from "../types/index.js";

export const ConsultarSoportesInput = z.object({
  fechaSolicitud: z.string().date(),
  pais: z.string().length(2),
  requeridos: z.array(z.string().min(1)).min(1)
});

export type ConsultarSoportesInput =
  z.infer<typeof ConsultarSoportesInput>;

export async function consultarSoportes(
  input: ConsultarSoportesInput,
  indexPath: string
): Promise<SupportValidationResult> {
  const data = ConsultarSoportesInput.parse(input);

  const content = await readFile(indexPath, "utf8");
  const index = JSON.parse(content) as SupportIndexEntry[];

  const byType = new Map(
    index.map((entry) => [entry.tipo, entry])
  );

  const found: SupportIndexEntry[] = [];
  const missing: string[] = [];
  const expired: string[] = [];
  const errors: string[] = [];

  const requestDate = new Date(`${data.fechaSolicitud}T00:00:00Z`);

  for (const requiredType of data.requeridos) {
    const entry = byType.get(requiredType);

    if (!entry) {
      missing.push(requiredType);
      continue;
    }

    if (entry.pais_emisor !== data.pais) {
      errors.push(
        `El soporte ${requiredType} fue emitido en ${entry.pais_emisor}, `
        + `pero se requiere ${data.pais}.`
      );
      continue;
    }

    if (entry.vigencia_hasta) {
      const expirationDate =
        new Date(`${entry.vigencia_hasta}T23:59:59Z`);

      if (requestDate > expirationDate) {
        expired.push(requiredType);
        continue;
      }
    }

    found.push(entry);
  }

  return {
    valid:
      missing.length === 0 &&
      expired.length === 0 &&
      errors.length === 0,

    required: data.requeridos,
    found,
    missing,
    expired,
    errors
  };
}