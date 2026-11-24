export interface RequestData {
  requestId: string;
  applicantName?: string;
  documentNumber?: string;
  companyName?: string;
  country?: string;
  procedure?: string;
  source: "fixture" | "chat" | "email" | "manual";
}

export interface MasterRecord {
  documentNumber: string;
  name: string;
  company: string;
  country?: string;
  position?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
