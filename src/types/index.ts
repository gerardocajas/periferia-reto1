export interface RequestData {
  requestId: string;
  source: "fixture" | "chat" | "email" | "manual";

  from?: string;
  to?: string;
  subject?: string;
  date?: string;

  country?: string;
  client?: string;
  format?: "xlsx" | "pdf" | "portal";

  body?: string;
  attachments?: string[];
}

export interface MasterData {
  razon_social: string;
  tipo_sociedad: string;
  nit: string;
  digito_verificacion: string;
  pais: string;
  ciudad: string;
  departamento: string;
  direccion: string;
  codigo_postal: string;
  telefono: string;
  sitio_web: string;
  fecha_constitucion: string;
  matricula_mercantil: string;
  ciiu_principal: string;
  ciiu_secundario?: string;
  actividad_economica: string;
  regimen_tributario: string;
  gran_contribuyente: boolean;
  autorretenedor: boolean;
  numero_empleados: number;

  ingresos_ultimo_ano: {
    valor: number;
    moneda: string;
    ano: number;
  };

  certificaciones: string[];

  representante_legal: {
    nombre: string;
    tipo_identificacion: string;
    identificacion: string;
    cargo: string;
    email: string;
  };

  contacto_comercial: {
    nombre: string;
    cargo: string;
    email: string;
    telefono: string;
  };

  contacto_financiero: {
    nombre: string;
    cargo: string;
    email: string;
    telefono: string;
  };

  banco: {
    nombre: string;
    tipo_cuenta: string;
    numero_cuenta: string;
    titular: string;
    swift: string;
    moneda: string;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SupportIndexEntry {
  tipo: string;
  archivo: string;
  vigencia_hasta: string | null;
  pais_emisor: string;
  descripcion: string;
}

export interface SupportValidationResult {
  valid: boolean;
  required: string[];
  found: SupportIndexEntry[];
  missing: string[];
  expired: string[];
  errors: string[];
}