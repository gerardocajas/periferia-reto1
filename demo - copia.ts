import { MasterRepository } from "./src/services/repository.js";
import { validateRequest } from "./src/services/validator.js";
import { buscarProveedor } from "./src/tools/proveedor.js";
import type { MasterRecord, RequestData } from "./src/types/index.js";

const repository = new MasterRepository([
  {
    documentNumber: "DEMO-001",
    name: "Proveedor Demo",
    company: "Empresa Demo SAS",
    country: "CO",
    position: "Representante Legal"
  }
] satisfies MasterRecord[]);

const request: RequestData = {
  requestId: "demo-001",
  applicantName: "Proveedor Demo",
  documentNumber: "DEMO-001",
  companyName: "Empresa Demo SAS",
  country: "CO",
  procedure: "TRAMITE_DEMO",
  source: "fixture"
};

console.log("=== RETO 01 / DEMO DETERMINISTA ===");
const lookup = buscarProveedor({ identificacion: request.documentNumber! }, repository);
console.log("buscarProveedor:", lookup);

const validation = validateRequest(request, lookup.proveedor);
console.log("validación:", validation);
console.log(validation.valid ? "✓ Caso válido" : "✗ Caso inválido");
