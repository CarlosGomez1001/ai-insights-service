import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { apiKeyAuth } from '../src/middleware/apiKeyAuth';
import { config } from '../src/config/env';

const makeRes = () => {
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res as Response;
};

describe('apiKeyAuth', () => {
    it('rechaza con 401 si no hay header x-api-key', () => {
        const req = { headers: {} } as Request;
        const res = makeRes();
        const next = vi.fn();

        apiKeyAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('rechaza con 403 si la key no coincide', () => {
        const req = { headers: { 'x-api-key': 'clave-incorrecta' } } as unknown as Request;
        const res = makeRes();
        const next = vi.fn();

        apiKeyAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('llama a next() si la key coincide', () => {
        const req = { headers: { 'x-api-key': config.apiKey } } as unknown as Request;
        const res = makeRes();
        const next = vi.fn();

        apiKeyAuth(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(res.status).not.toHaveBeenCalled();
    });
});
