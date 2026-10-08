import type { CustomerContext } from '../schemas/customerContext.schema';
import type { CustomerInsight } from '../schemas/customerInsight.schema';

/**
 * Arma el mensaje que le da al chat el contexto/insight ya generados,
 * antes del historial de la conversación. Solo serializa — las reglas
 * viven en el system prompt (versionado por separado).
 */
export const buildCustomerChatContextPrompt = (contexto: CustomerContext, insight: CustomerInsight): string => {
    return `Contexto del cliente:
${JSON.stringify(contexto, null, 2)}

Insight ya generado sobre este cliente:
${JSON.stringify(insight, null, 2)}

A partir de aquí, responde las preguntas de seguimiento del usuario sobre este cliente.`;
};
