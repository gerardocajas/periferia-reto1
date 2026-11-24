import { z } from "zod";
import { MasterRepository } from "../services/repository.js";

export const BuscarProveedorInput = z.object({
  identificacion: z.string().trim().min(1).optional(),
  razonSocial: z.string().trim().min(1).optional()
}).refine(
  (value) => Boolean(value.identificacion || value.razonSocial),
  {
    message: "Debe proporcionar identificacion o razonSocial"
  }
);

export type BuscarProveedorInput = z.infer<typeof BuscarProveedorInput>;

export function buscarProveedor(
  input: BuscarProveedorInput,
  repository: MasterRepository
) {
  const data = BuscarProveedorInput.parse(input);

  const record = data.identificacion
    ? repository.findByNit(data.identificacion)
    : repository.findByCompanyName(data.razonSocial!);

  if (!record) {
    return {
      encontrado: false,
      proveedor: null
    };
  }

  return {
    encontrado: true,
    proveedor: {
      razon_social: record.razon_social,
      nit: record.nit,
      digito_verificacion: record.digito_verificacion,
      pais: record.pais,
      representante_legal: record.representante_legal,
      contacto_comercial: record.contacto_comercial
    }
  };
}