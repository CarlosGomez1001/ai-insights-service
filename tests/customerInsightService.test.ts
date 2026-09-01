import { describe, expect, it, beforeAll } from 'vitest';

// MOCK_OPENAI debe estar activo antes de que config/env.ts se importe
// (dentro de customerInsightService), para que el servicio use MockProvider
// y no intente llamar a OpenAI durante el test.
beforeAll(() => {
    process.env.MOCK_OPENAI = 'true';
});

describe('generateCustomerInsight (con MockProvider)', () => {
    it('devuelve un insight y metadata con la forma esperada usando el mock', async () => {
        const { generateCustomerInsight } = await import('../src/services/insights/customerInsightService');

        const request = {
            tipoEntidad: 'cliente',
            idEntidad: 123,
            versionContexto: '1.0.0',
            contexto: {
                cliente: { IdCliente: 123, RazonSocial: 'Empresa ABC' },
                comercial: { cotizaciones: [], pedidos: [] },
                facturacion: { facturas: [], pagos: [], notasCredito: [] },
                servicio: { equipos: [] },
                metricas: {},
                comparaciones: {},
                alertas: [],
                tendencias: {},
                senalesNegocio: {},
            },
        };

        const result = await generateCustomerInsight(request);

        expect(result.insight.resumen).toContain('[MOCK]');
        expect(result.metadata.versionContexto).toBe('1.0.0');
        expect(result.metadata.modelo).toBe('mock-provider');
    });

    it('rechaza un request con tipoEntidad invalido', async () => {
        const { generateCustomerInsight } = await import('../src/services/insights/customerInsightService');

        await expect(generateCustomerInsight({ tipoEntidad: 'prospecto', idEntidad: 1 })).rejects.toThrow();
    });
});
