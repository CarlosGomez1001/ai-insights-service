import { describe, expect, it, beforeAll } from 'vitest';
import { customerChatRequestSchema, MAX_TURNOS_HISTORIAL } from '../src/schemas/customerChat.schema';

const contextoValido = {
    cliente: { IdCliente: '464', RazonSocial: 'Empresa ABC' },
    comercial: { cotizaciones: [], pedidos: [] },
    facturacion: { facturas: [], pagos: [], notasCredito: [] },
    servicio: { equipos: [] },
    metricas: {},
    comparaciones: [],
    alertas: [],
    tendencias: [],
    senalesNegocio: {},
};

const insightValido = {
    resumen: 'x',
    salud: { estado: 'atencion', puntaje: 65 },
    riesgos: [],
    oportunidades: [],
    accionesRecomendadas: [],
};

const requestBase = {
    idEntidad: 464,
    contexto: contextoValido,
    insight: insightValido,
    historial: [],
    pregunta: '¿Cual es la factura mas antigua?',
};

describe('customerChatRequestSchema', () => {
    it('acepta un request bien formado, reusando el contexto/insight ya cacheados', () => {
        const result = customerChatRequestSchema.safeParse(requestBase);
        expect(result.success).toBe(true);
    });

    it('rechaza una pregunta vacia', () => {
        const result = customerChatRequestSchema.safeParse({ ...requestBase, pregunta: '' });
        expect(result.success).toBe(false);
    });

    it(`rechaza historial con mas de ${MAX_TURNOS_HISTORIAL} turnos`, () => {
        const historialLargo = Array.from({ length: MAX_TURNOS_HISTORIAL + 1 }, () => ({ rol: 'usuario' as const, contenido: 'x' }));
        const result = customerChatRequestSchema.safeParse({ ...requestBase, historial: historialLargo });
        expect(result.success).toBe(false);
    });

    it(`acepta historial con exactamente ${MAX_TURNOS_HISTORIAL} turnos`, () => {
        const historialLimite = Array.from({ length: MAX_TURNOS_HISTORIAL }, () => ({ rol: 'usuario' as const, contenido: 'x' }));
        const result = customerChatRequestSchema.safeParse({ ...requestBase, historial: historialLimite });
        expect(result.success).toBe(true);
    });

    it('rechaza un rol de historial fuera del enum', () => {
        const result = customerChatRequestSchema.safeParse({
            ...requestBase,
            historial: [{ rol: 'sistema', contenido: 'x' }],
        });
        expect(result.success).toBe(false);
    });
});

describe('generateCustomerChat (con MockProvider)', () => {
    beforeAll(() => {
        process.env.MOCK_OPENAI = 'true';
    });

    it('devuelve una respuesta y metadata con la forma esperada usando el mock', async () => {
        const { generateCustomerChat } = await import('../src/services/chat/customerChatService');

        const result = await generateCustomerChat(requestBase);

        expect(result.respuesta).toContain('[MOCK]');
        expect(result.metadata.modelo).toBe('mock-provider');
        expect(result.metadata.versionPrompt).toBe('1.0.0');
    });

    it('rechaza un request sin pregunta', async () => {
        const { generateCustomerChat } = await import('../src/services/chat/customerChatService');
        const { pregunta, ...sinPregunta } = requestBase;

        await expect(generateCustomerChat(sinPregunta)).rejects.toThrow();
    });
});
