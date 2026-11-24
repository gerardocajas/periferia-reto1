import type { RequestData } from "../types/index.js";

export interface AgentEvent {
  type: "message" | "tool_call" | "confirmation_required" | "completed" | "error";
  message: string;
  tool?: string;
}

export class DocumentAgent {
  async handle(request: RequestData): Promise<AgentEvent[]> {
    return [
      { type: "message", message: `Solicitud recibida: ${request.requestId}` }
    ];
  }
}
