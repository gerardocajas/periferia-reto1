import { z } from "zod";

export const ConsultarSoportesInput = z.object({
  proveedorId: z.string().min(1)
});

export type ConsultarSoportesInput = z.infer<typeof ConsultarSoportesInput>;
