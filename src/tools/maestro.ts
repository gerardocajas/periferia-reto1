import { z } from "zod";

export const ConsultarMaestroInput = z.object({
  identificacion: z.string().min(1)
});

export type ConsultarMaestroInput = z.infer<typeof ConsultarMaestroInput>;
