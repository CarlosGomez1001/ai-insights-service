/**
 * Logging estructurado minimo. Nunca recibe el contexto completo del
 * cliente ni ninguna API key — solo metadata tecnica (ids, duracion,
 * modelo, exito/error) segun la seccion de observabilidad del diseño.
 */
type LogFields = Record<string, string | number | boolean | null | undefined>;

const log = (level: 'info' | 'warn' | 'error', message: string, fields: LogFields = {}) => {
    const entry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...fields,
    };
    const line = JSON.stringify(entry);
    if (level === 'error') console.error(line);
    else if (level === 'warn') console.warn(line);
    else console.log(line);
};

export const logger = {
    info: (message: string, fields?: LogFields) => log('info', message, fields),
    warn: (message: string, fields?: LogFields) => log('warn', message, fields),
    error: (message: string, fields?: LogFields) => log('error', message, fields),
};
