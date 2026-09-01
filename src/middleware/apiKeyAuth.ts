import type { NextFunction, Request, Response } from 'express';
import { config } from '../config/env';

/**
 * Valida el header `x-api-key` contra AI_SERVICE_API_KEY. Este servicio
 * nunca debe ser alcanzable desde el browser (no hay CORS habilitado) —
 * solo el backend PHP, dentro de la red Docker o vía loopback, conoce esta
 * clave. Mirror de microservices/notifications/src/middleware/apiKeyAuth.js.
 */
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction): void => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        res.status(401).json({ success: false, message: 'API Key requerida (header x-api-key)' });
        return;
    }

    if (apiKey !== config.apiKey) {
        res.status(403).json({ success: false, message: 'API Key invalida' });
        return;
    }

    next();
};
