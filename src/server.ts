import express from 'express';
import { config } from './config/env';
import { logger } from './utils/logger';
import healthRoutes from './routes/health.routes';
import insightsRoutes from './routes/insights.routes';
import chatRoutes from './routes/chat.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Sin CORS: este servicio solo debe ser alcanzable desde el backend PHP
// (red Docker / loopback), nunca directo desde el navegador.
app.use(express.json({ limit: '1mb' }));

app.use('/ai', healthRoutes);
app.use('/ai', insightsRoutes);
app.use('/ai', chatRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
    logger.info('AI Service iniciado', { port: config.port, nodeEnv: config.nodeEnv, mockOpenai: config.mockOpenai });
});
