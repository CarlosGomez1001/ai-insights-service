import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { config } from '../../config/env';
import { customerInsightSchema } from '../../schemas/customerInsight.schema';
import { customerChatResponseSchema, type ChatMensaje } from '../../schemas/customerChat.schema';
import { logger } from '../../utils/logger';
import type { LLMProvider, CustomerInsightGenerationResult, CustomerChatGenerationResult } from './LLMProvider';

const mapRolToOpenAI = (rol: ChatMensaje['rol']): 'user' | 'assistant' => (rol === 'usuario' ? 'user' : 'assistant');

/**
 * Implementación de LLMProvider sobre el SDK oficial de OpenAI, usando
 * Structured Outputs (zodResponseFormat) para forzar que la respuesta
 * cumpla customerInsightSchema — si no cumple, el SDK ya rechaza antes de
 * que este código la use.
 */
export class OpenAIProvider implements LLMProvider {
    private client: OpenAI;

    constructor() {
        this.client = new OpenAI({ apiKey: config.openaiApiKey, timeout: 30_000 });
    }

    async generateCustomerInsight(systemPrompt: string, userPrompt: string): Promise<CustomerInsightGenerationResult> {
        const completion = await this.client.beta.chat.completions.parse({
            model: config.openaiModel,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            response_format: zodResponseFormat(customerInsightSchema, 'customer_insight'),
        });

        const parsed = completion.choices[0]?.message?.parsed;
        if (!parsed) {
            logger.error('OpenAI no devolvio una respuesta parseable', { model: config.openaiModel });
            throw new Error('El modelo no devolvio una respuesta valida');
        }

        return { insight: parsed, model: completion.model };
    }

    async generateChatResponse(systemPrompt: string, contextoPrompt: string, historial: ChatMensaje[]): Promise<CustomerChatGenerationResult> {
        const completion = await this.client.beta.chat.completions.parse({
            model: config.openaiModel,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: contextoPrompt },
                ...historial.map((mensaje) => ({ role: mapRolToOpenAI(mensaje.rol), content: mensaje.contenido })),
            ],
            response_format: zodResponseFormat(customerChatResponseSchema, 'customer_chat'),
        });

        const parsed = completion.choices[0]?.message?.parsed;
        if (!parsed) {
            logger.error('OpenAI no devolvio una respuesta de chat parseable', { model: config.openaiModel });
            throw new Error('El modelo no devolvio una respuesta valida');
        }

        return { respuesta: parsed.respuesta, model: completion.model };
    }
}
