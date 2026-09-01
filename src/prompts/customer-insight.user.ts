import type { CustomerContext } from '../schemas/customerContext.schema';

/**
 * Arma el mensaje de usuario a partir del contexto ya validado. Solo
 * serializa el contexto — no agrega instrucciones nuevas aquí (esas viven
 * en el system prompt, versionado por separado).
 */
export const buildCustomerInsightUserPrompt = (contexto: CustomerContext): string => {
    return `Analiza el siguiente contexto de cliente y genera el insight estructurado:

${JSON.stringify(contexto, null, 2)}`;
};
