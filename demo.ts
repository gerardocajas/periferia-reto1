import path from "node:path";
import { fileURLToPath } from "node:url";
import { MasterRepository } from "./src/services/repository.js";
import { processCase } from "./src/services/casos.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixtureRoot = path.join(
  __dirname,
  "fixtures",
  "reto-01"
);

const repository = await MasterRepository.fromFile(
  path.join(
    fixtureRoot,
    "repositorio",
    "maestro.json"
  )
);

const cases = [
  "co-industrias-delta",
  "ec-corp-andina",
  "hn-agroexport-sula",
  "pa-logistica-istmo"
];

console.log("=== RETO 01 / CASOS OFICIALES ===");

for (const caseId of cases) {
  console.log(`\n========================================`);
  console.log(`CASO: ${caseId}`);
  console.log(`========================================`);

  const result = await processCase(
    caseId,
    fixtureRoot,
    repository
  );

  console.log(`Formato: ${result.format}`);
  console.log(
    `Solicitud: ${result.requestValid ? "✓ válida" : "✗ inválida"}`
  );
  console.log(
    `Soportes: ${result.supportValid ? "✓ completos" : "✗ requieren revisión"}`
  );
  console.log(
    `Campos: ${result.fieldsValid ? "✓ completos" : "✗ requieren revisión"}`
  );

  console.log(`Estado: ${result.status}`);

  if (result.missingOptionalFields.length > 0) {
    console.log(
      `Campos opcionales no resueltos: ${result.missingOptionalFields.join(", ")}`
    );
  }

  if (result.reasons.length > 0) {
    console.log("Motivos:");
    for (const reason of result.reasons) {
      console.log(`  - ${reason}`);
    }
  }
}