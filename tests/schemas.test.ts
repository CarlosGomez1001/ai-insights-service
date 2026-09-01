import { describe, expect, it } from 'vitest';
import { customerInsightRequestSchema } from '../src/schemas/customerContext.schema';
import { customerInsightSchema } from '../src/schemas/customerInsight.schema';

const validRequest = {
    tipoEntidad: 'cliente',
    idEntidad: 123,
    versionContexto: '1.0.0',
    contexto: {
        cliente: { IdCliente: 123, RazonSocial: 'Empresa ABC', Estado: 'activo' },
        comercial: { cotizaciones: [], pedidos: [] },
        facturacion: { facturas: [], pagos: [], notasCredito: [] },
        servicio: { equipos: [] },
        metricas: { ventasTotales: 125000, diasPromedioPago: 48 },
        comparaciones: {
            diasPago: { cliente: 48, promedioEmpresa: 25, estado: 'por_encima_del_promedio' },
        },
        alertas: [{ tipo: 'atraso_pago', severidad: 'alta', estado: 'activa' }],
        tendencias: { ventas: { direccion: 'decreciente', porcentajeCambio: -28 } },
        senalesNegocio: { saludCliente: 'en_riesgo' },
    },
};

describe('customerInsightRequestSchema', () => {
    it('acepta un request bien formado', () => {
        const result = customerInsightRequestSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
    });

    it('rechaza un tipoEntidad distinto de "cliente"', () => {
        const result = customerInsightRequestSchema.safeParse({ ...validRequest, tipoEntidad: 'prospecto' });
        expect(result.success).toBe(false);
    });

    it('rechaza si falta el objeto cliente', () => {
        const { contexto, ...rest } = validRequest;
        const { cliente, ...contextoSinCliente } = contexto;
        const result = customerInsightRequestSchema.safeParse({ ...rest, contexto: contextoSinCliente });
        expect(result.success).toBe(false);
    });

    it('rellena con default los arreglos internos de una seccion vacia', () => {
        const { contexto, ...rest } = validRequest;
        const result = customerInsightRequestSchema.safeParse({ ...rest, contexto: { ...contexto, comercial: {} } });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.contexto.comercial.cotizaciones).toEqual([]);
            expect(result.data.contexto.comercial.pedidos).toEqual([]);
        }
    });

    // Regresión: PHP/PDO (SQL Server) devuelve IdCliente como string, y un
    // array asociativo PHP vacío ("comparaciones"/"tendencias" sin datos)
    // se serializa como JSON "[]", no "{}". Caso real reportado contra el
    // endpoint /crm/ai/insights/customer.
    it('acepta IdCliente como string numérico y tendencias/comparaciones vacías como "[]"', () => {
        const { contexto, ...rest } = validRequest;
        const result = customerInsightRequestSchema.safeParse({
            ...rest,
            contexto: {
                ...contexto,
                cliente: { ...contexto.cliente, IdCliente: '464' },
                comparaciones: [],
                tendencias: [],
            },
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.contexto.cliente.IdCliente).toBe(464);
            expect(result.data.contexto.comparaciones).toEqual({});
            expect(result.data.contexto.tendencias).toEqual({});
        }
    });
});

describe('customerInsightSchema', () => {
    it('rechaza una severidad fuera del enum', () => {
        const result = customerInsightSchema.safeParse({
            resumen: 'x',
            salud: { estado: 'atencion', puntaje: 50 },
            riesgos: [{ tipo: 'x', severidad: 'extrema', motivo: 'x' }],
            oportunidades: [],
            accionesRecomendadas: [],
        });
        expect(result.success).toBe(false);
    });

    it('rechaza un puntaje fuera de 0-100', () => {
        const result = customerInsightSchema.safeParse({
            resumen: 'x',
            salud: { estado: 'atencion', puntaje: 150 },
            riesgos: [],
            oportunidades: [],
            accionesRecomendadas: [],
        });
        expect(result.success).toBe(false);
    });
});
