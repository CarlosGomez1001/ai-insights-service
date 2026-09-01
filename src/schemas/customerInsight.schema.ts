import { z } from 'zod';

/**
 * Valida la respuesta estructurada del LLM antes de devolverla a PHP.
 * Si el modelo produce algo que no cumple este schema, se trata como error
 * (nunca se reenvía texto libre sin validar).
 */
export const customerInsightSchema = z.object({
    resumen: z.string(),
    salud: z.object({
        estado: z.enum(['saludable', 'atencion', 'en_riesgo', 'critico']),
        puntaje: z.number().min(0).max(100),
    }),
    riesgos: z.array(z.object({
        tipo: z.string(),
        severidad: z.enum(['baja', 'media', 'alta', 'critica']),
        motivo: z.string(),
    })),
    oportunidades: z.array(z.object({
        tipo: z.string(),
        prioridad: z.enum(['baja', 'media', 'alta']),
        motivo: z.string(),
    })),
    accionesRecomendadas: z.array(z.object({
        prioridad: z.number().int().positive(),
        accion: z.string(),
        motivo: z.string(),
    })),
});

export type CustomerInsight = z.infer<typeof customerInsightSchema>;

export const insightMetadataSchema = z.object({
    modelo: z.string(),
    versionPrompt: z.string(),
    versionContexto: z.string(),
    generadoEn: z.string(),
});

export type InsightMetadata = z.infer<typeof insightMetadataSchema>;

export const customerInsightResponseSchema = z.object({
    insight: customerInsightSchema,
    metadata: insightMetadataSchema,
});

export type CustomerInsightResponse = z.infer<typeof customerInsightResponseSchema>;
