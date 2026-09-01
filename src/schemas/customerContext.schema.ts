import { z } from 'zod';

/**
 * Valida el contexto que arma PHP (CustomerDataBuilder + CustomerInsightBuilder)
 * antes de llamar a este servicio. Las claves van en español, alineadas con
 * las columnas reales del CRM (ver API_CONTRACT.md del cluster y el plan de
 * diseño) — este schema es el contrato de entrada, no lo inventa el LLM.
 *
 * Las secciones internas (comercial, facturacion, servicio) llegan como
 * arreglos de objetos "sueltos" — el shape exacto de cada fila lo define el
 * SQL de origen en PHP, así que aquí solo se valida que sean arreglos de
 * objetos, no columna por columna (evita que este schema se desincronice
 * cada vez que cambie una consulta del lado PHP).
 */
const filaLibre = z.record(z.string(), z.unknown());

/**
 * PHP serializa un array asociativo vacío como JSON "[]" (no "{}"), porque
 * un array PHP sin llaves de string es indistinguible de una lista vacía.
 * Los campos tipo "record" (metricas/comparaciones/tendencias/senalesNegocio)
 * quedan vacíos legítimamente cuando no hay suficiente historial para
 * calcularlos (ver CustomerInsightBuilder) — este preprocesador normaliza
 * ese "[]" a "{}" antes de validar, sin afectar el caso normal (objeto con
 * datos).
 */
const recordVacioTolerante = <T extends z.ZodTypeAny>(shape: T) =>
    z.preprocess((valor) => (Array.isArray(valor) && valor.length === 0 ? {} : valor), shape);

const alertaSchema = z.object({
    tipo: z.string(),
    severidad: z.enum(['baja', 'media', 'alta', 'critica']),
    estado: z.string(),
    descripcion: z.string().optional(),
});

const comparacionSchema = z.object({
    cliente: z.number(),
    promedioEmpresa: z.number(),
    diferencia: z.number().optional(),
    porcentajeDiferencia: z.number().optional(),
    estado: z.string(),
});

const tendenciaSchema = z.object({
    direccion: z.enum(['creciente', 'decreciente', 'estable']),
    porcentajeCambio: z.number(),
});

export const customerContextSchema = z.object({
    cliente: z.object({
        // PDO/ODBC (SQL Server) devuelve todas las columnas como string,
        // incluida la llave numérica — z.coerce acepta "464" o 464.
        IdCliente: z.coerce.number(),
        RazonSocial: z.string(),
        Estado: z.string().optional(),
    }).passthrough(),
    comercial: z.object({
        cotizaciones: z.array(filaLibre).default([]),
        pedidos: z.array(filaLibre).default([]),
    }),
    facturacion: z.object({
        facturas: z.array(filaLibre).default([]),
        pagos: z.array(filaLibre).default([]),
        notasCredito: z.array(filaLibre).default([]),
    }),
    servicio: z.object({
        equipos: z.array(filaLibre).default([]),
    }),
    metricas: recordVacioTolerante(z.record(z.string(), z.union([z.number(), z.string(), z.null()])).default({})),
    comparaciones: recordVacioTolerante(z.record(z.string(), comparacionSchema).default({})),
    alertas: z.array(alertaSchema).default([]),
    tendencias: recordVacioTolerante(z.record(z.string(), tendenciaSchema).default({})),
    senalesNegocio: recordVacioTolerante(z.record(z.string(), z.string()).default({})),
});

export const customerInsightRequestSchema = z.object({
    tipoEntidad: z.literal('cliente'),
    idEntidad: z.number().int().positive(),
    versionContexto: z.string(),
    contexto: customerContextSchema,
});

export type CustomerContext = z.infer<typeof customerContextSchema>;
export type CustomerInsightRequest = z.infer<typeof customerInsightRequestSchema>;
