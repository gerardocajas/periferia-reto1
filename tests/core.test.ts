import { describe, expect, it } from "vitest";
import { MasterRepository } from "../src/services/repository.js";
import { validateRequest } from "../src/services/validator.js";
import type { MasterData, RequestData } from "../src/types/index.js";

const master: MasterData = {
  razon_social: "Periferia IT Group S.A.S.",
  tipo_sociedad: "Sociedad por Acciones Simplificada",
  nit: "900123456",
  digito_verificacion: "7",
  pais: "CO",
  ciudad: "Medellín",
  departamento: "Antioquia",
  direccion: "Calle 10 # 43A-25, Oficina 501",
  codigo_postal: "050021",
  telefono: "+57 604 555 0100",
  sitio_web: "https://www.periferia-ficticia.com",
  fecha_constitucion: "2008-03-14",
  matricula_mercantil: "21-345678-12",
  ciiu_principal: "6201",
  ciiu_secundario: "6202",
  actividad_economica:
    "Desarrollo de sistemas informáticos y consultoría en tecnologías de la información",
  regimen_tributario: "Responsable de IVA",
  gran_contribuyente: false,
  autorretenedor: false,
  numero_empleados: 480,
  ingresos_ultimo_ano: {
    valor: 98000000000,
    moneda: "COP",
    ano: 2025,
  },
  certificaciones: ["ISO 9001:2015", "ISO 27001:2022"],
  representante_legal: {
    nombre: "Roberto Andrade Salazar",
    tipo_identificacion: "CC",
    identificacion: "71555123",
    cargo: "Gerente General",
    email: "gerencia@periferia-ficticia.com",
  },
  contacto_comercial: {
    nombre: "Laura Gómez Restrepo",
    cargo: "Directora Comercial",
    email: "lgomez@periferia-ficticia.com",
    telefono: "+57 300 555 0101",
  },
  contacto_financiero: {
    nombre: "Camila Ortiz Vélez",
    cargo: "Analista Administrativa",
    email: "facturacion@periferia-ficticia.com",
    telefono: "+57 604 555 0102",
  },
  banco: {
    nombre: "Bancolombia S.A.",
    tipo_cuenta: "Ahorros",
    numero_cuenta: "03100012345",
    titular: "Periferia IT Group S.A.S.",
    swift: "COLOCOBM",
    moneda: "COP",
  },
};

describe("core determinista", () => {
  it("encuentra el proveedor por NIT", () => {
    const repository = new MasterRepository(master);

    const result = repository.findByNit("900123456");

    expect(result).not.toBeNull();
    expect(result?.razon_social).toBe("Periferia IT Group S.A.S.");
  });

  it("rechaza una solicitud sin fecha", () => {
    const request: RequestData = {
      requestId: "test-sin-fecha",
      source: "manual",
      format: "xlsx",
    };

    const result = validateRequest(request, master);

    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("fecha");
  });

  it("permite una solicitud internacional para un proveedor colombiano", () => {
    const request: RequestData = {
      requestId: "test-internacional",
      source: "manual",
      date: "2026-08-27",
      country: "EC",
      format: "pdf",
      body: "Solicitud de registro de proveedor",
    };

    const result = validateRequest(request, master);

    expect(result.valid).toBe(true);
  });
});