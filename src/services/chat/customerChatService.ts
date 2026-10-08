import { config } from '../../config/env';
import {
    customerChatRequestSchema,
    customerChatResponseSchema,
    type CustomerChatRequest,
    type CustomerChatFullResponse,
} from '../../schemas/customerChat.schema';
import { customerChatSystemPrompt, CUSTOMER_CHAT_PROMPT_VERSION } from '../../prompts/customer-chat.system';
import { buildCustomerChatContextPrompt } from '../../prompts/customer-chat.user';
import { OpenAIProvider } from '../openai/OpenAIProvider';
import { MockProvider } from '../openai/MockProvider';
import type { LLMProvider } from '../openai/LLMProvider';
import { logger } from '../../utils/logger';

const getProvider = (): LLMProvider => (config.mockOpenai ? new MockProvider() : new OpenAIProvider());

/**
 * Orquesta la respuesta del AI Chat simplificado: valida el request
 * (incluye contexto/insight que PHP reenvía tal cual, sin volver a
 * construirlos), arma el prompt (contexto+insight como mensaje base +
 * historial + pregunta nueva), llama al provider, valida la salida y
 * arma la respuesta final con metadata.
 */
export const generateCustomerChat = async (rawBody: unknown): Promise<CustomerChatFullResponse> => {
    const parsedRequest = customerChatRequestSchema.safeParse(rawBody);

    if (!parsedRequest.success) {
        logger.warn('Request de chat de cliente invalido', { issues: parsedRequest.error.issues.length });
        throw Object.assign(new Error('Contexto de chat invalido'), { statusCode: 400 });
    }

    const request: CustomerChatRequest = parsedRequest.data;
    const startedAt = Date.now();

    const provider = getProvider();
    const systemPrompt = customerChatSystemPrompt;
    const contextoPrompt = buildCustomerChatContextPrompt(request.contexto, request.insight);
    const historialCompleto = [...request.historial, { rol: 'usuario' as const, contenido: request.pregunta }];

    const result = await provider.generateChatResponse(systemPrompt, contextoPrompt, historialCompleto);

    const validatedResponse = customerChatResponseSchema.safeParse({ respuesta: result.respuesta });
    if (!validatedResponse.success) {
        logger.error('La respuesta de chat no cumple el schema esperado', {
            idEntidad: request.idEntidad,
            issues: validatedResponse.error.issues.length,
        });
        throw Object.assign(new Error('El modelo no devolvio una respuesta con la forma esperada'), { statusCode: 502 });
    }

    logger.info('Respuesta de chat generada', {
        idEntidad: request.idEntidad,
        modelo: result.model,
        durationMs: Date.now() - startedAt,
    });

    return {
        respuesta: validatedResponse.data.respuesta,
        metadata: {
            modelo: result.model,
            versionPrompt: CUSTOMER_CHAT_PROMPT_VERSION,
            generadoEn: new Date().toISOString(),
        },
    };
};
