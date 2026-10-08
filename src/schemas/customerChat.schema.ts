import { z } from 'zod';
import { customerContextSchema } from './customerContext.schema';
import { customerInsightSchema } from './customerInsight.schema';

/**
 * Contrato del AI Chat simplificado (sin RAG/pgvector/embeddings — ver
 * plan de diseño). PHP reenvía tal cual el `contexto`/`insight` que ya
 * había generado y cacheado el frontend en la llamada de insight — este
 * endpoint no vuelve a construir nada, solo valida forma y llama a OpenAI.
 */
export const MAX_TURNOS_HISTORIAL = 10;

const mensajeChatSchema = z.object({
    rol: z.enum(['usuario', 'asistente']),
    contenido: z.string().min(1),
});

export const customerChatRequestSchema = z.object({
    idEntidad: z.coerce.number().int().positive(),
    contexto: customerContextSchema,
    insight: customerInsightSchema,
    historial: z.array(mensajeChatSchema).max(MAX_TURNOS_HISTORIAL).default([]),
    pregunta: z.string().min(1).max(2000),
});

export const customerChatResponseSchema = z.object({
    respuesta: z.string(),
});

export const customerChatMetadataSchema = z.object({
    modelo: z.string(),
    versionPrompt: z.string(),
    generadoEn: z.string(),
});

export type ChatMensaje = z.infer<typeof mensajeChatSchema>;
export type CustomerChatRequest = z.infer<typeof customerChatRequestSchema>;
export type CustomerChatResponseBody = z.infer<typeof customerChatResponseSchema>;
export type CustomerChatMetadata = z.infer<typeof customerChatMetadataSchema>;

export interface CustomerChatFullResponse {
    respuesta: string;
    metadata: CustomerChatMetadata;
}
