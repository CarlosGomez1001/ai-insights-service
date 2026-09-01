/**
 * Placeholder del módulo de AI Chat (RAG + pgvector + generación de SQL
 * controlada). No se implementa en esta fase — solo se deja el hueco
 * arquitectónico para que el chat viva aquí más adelante, separado por
 * completo de services/insights/.
 */
export interface ChatRequest {
    tenant: string;
    idEmpleado: number;
    pregunta: string;
}

export interface ChatResponse {
    respuesta: string;
}
