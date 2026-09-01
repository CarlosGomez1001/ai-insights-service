import type { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

interface HttpError extends Error {
    statusCode?: number;
}

/**
 * Manejador global de errores. Nunca loguea el body/contexto completo del
 * request, solo el mensaje técnico y el status.
 */
export const errorHandler = (err: HttpError, _req: Request, res: Response, _next: NextFunction): void => {
    const statusCode = err.statusCode || 500;
    logger.error(err.message, { statusCode });

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Error interno del servidor',
    });
};
