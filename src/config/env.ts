import 'dotenv/config';

export const config = {
    port: Number(process.env.PORT) || 3005,
    nodeEnv: process.env.NODE_ENV || 'development',
    apiKey: process.env.AI_SERVICE_API_KEY || 'changeme-generate-a-secure-key',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    mockOpenai: process.env.MOCK_OPENAI === 'true',
};
