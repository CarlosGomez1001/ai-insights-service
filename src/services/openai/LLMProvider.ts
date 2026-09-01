import type { CustomerInsight } from '../../schemas/customerInsight.schema';

/**
 * Abstracción del proveedor de LLM. Permite sustituir OpenAI por otro
 * proveedor (Azure OpenAI, modelo local, etc.) sin tocar el resto del
 * servicio — solo se implementa esta interfaz de nuevo.
 */
export interface CustomerInsightGenerationResult {
    insight: CustomerInsight;
    model: string;
}

export interface LLMProvider {
    generateCustomerInsight(systemPrompt: string, userPrompt: string): Promise<CustomerInsightGenerationResult>;
}
