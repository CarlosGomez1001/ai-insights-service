import { config } from '../../config/env';
import { customerInsightRequestSchema, type CustomerInsightRequest } from '../../schemas/customerContext.schema';
import { customerInsightSchema, type CustomerInsightResponse } from '../../schemas/customerInsight.schema';
import { customerInsightSystemPrompt, CUSTOMER_INSIGHT_PROMPT_VERSION } from '../../prompts/customer-insight.system';
import { buildCustomerInsightUserPrompt } from '../../prompts/customer-insight.user';
import { OpenAIProvider } from '../openai/OpenAIProvider';
import { MockProvider } from '../openai/MockProvider';
import type { LLMProvider } from '../openai/LLMProvider';
import { logger } from '../../utils/logger';

const getProvider = (): LLMProvider => (config.mockOpenai ? new MockProvider() : new OpenAIProvider());

/**
 * Orquesta la generación del insight de cliente: valida el request completo
 * (incluye el contexto armado por PHP), arma el prompt versionado, llama al
 * provider, valida la salida contra el schema y arma la respuesta final con
 * metadata de versionado/cache (generatedAt, promptVersion, contextVersion).
 */
export const generateCustomerInsight = async (rawBody: unknown): Promise<CustomerInsightResponse> => {
    const parsedRequest = customerInsightRequestSchema.safeParse(rawBody);

    if (!parsedRequest.success) {
        logger.warn('Request de insight de cliente invalido', { issues: parsedRequest.error.issues.length });
        throw Object.assign(new Error('Contexto de cliente invalido'), { statusCode: 400 });
    }

    const request: CustomerInsightRequest = parsedRequest.data;
    const startedAt = Date.now();

    const provider = getProvider();
    const systemPrompt = customerInsightSystemPrompt;
    const userPrompt = buildCustomerInsightUserPrompt(request.contexto);

    const result = await provider.generateCustomerInsight(systemPrompt, userPrompt);

    const validatedInsight = customerInsightSchema.safeParse(result.insight);
    if (!validatedInsight.success) {
        logger.error('El insight generado no cumple el schema esperado', {
            idEntidad: request.idEntidad,
            issues: validatedInsight.error.issues.length,
        });
        throw Object.assign(new Error('El modelo no devolvio un insight con la forma esperada'), { statusCode: 502 });
    }

    logger.info('Insight de cliente generado', {
        idEntidad: request.idEntidad,
        modelo: result.model,
        durationMs: Date.now() - startedAt,
    });

    return {
        insight: validatedInsight.data,
        metadata: {
            modelo: result.model,
            versionPrompt: CUSTOMER_INSIGHT_PROMPT_VERSION,
            versionContexto: request.versionContexto,
            generadoEn: new Date().toISOString(),
        },
    };
};
