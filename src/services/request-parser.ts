import { z } from "zod";
import type { RequestData } from "../types/index.js";

const FixtureRequestSchema = z.object({
  id: z.string().min(1),
  de: z.string().optional(),
  para: z.string().optional(),
  asunto: z.string().optional(),
  fecha: z.string().date(),
  pais: z.string().length(2),
  cliente: z.string().optional(),
  formato: z.enum(["xlsx", "pdf", "portal"]),
  cuerpo: z.string().optional(),
  adjuntos: z.array(z.string()).default([])
});

export function parseFixtureRequest(
  input: unknown
): RequestData {
  const data = FixtureRequestSchema.parse(input);

  return {
    requestId: data.id,
    source: "fixture",
    from: data.de,
    to: data.para,
    subject: data.asunto,
    date: data.fecha,
    country: data.pais,
    client: data.cliente,
    format: data.formato,
    body: data.cuerpo,
    attachments: data.adjuntos
  };
}