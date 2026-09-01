import type { LLMProvider, CustomerInsightGenerationResult } from './LLMProvider';

/**
 * Provider simulado (MOCK_OPENAI=true) — devuelve un insight fijo con la
 * forma correcta, sin llamar a OpenAI. Sirve para probar el flujo completo
 * PHP -> Node -> PHP sin gastar cuota ni requerir una API key real.
 */
export class MockProvider implements LLMProvider {
    async generateCustomerInsight(): Promise<CustomerInsightGenerationResult> {
        return {
            model: 'mock-provider',
            insight: {
                resumen: '[MOCK] Cliente con actividad estable, sin señales críticas en el contexto de prueba.',
                salud: { estado: 'atencion', puntaje: 65 },
                riesgos: [
                    { tipo: 'atraso_pago', severidad: 'media', motivo: '[MOCK] Motivo de ejemplo generado por el provider simulado.' },
                ],
                oportunidades: [
                    { tipo: 'venta_cruzada', prioridad: 'media', motivo: '[MOCK] Oportunidad de ejemplo.' },
                ],
                accionesRecomendadas: [
                    { prioridad: 1, accion: '[MOCK] Contactar al cliente para revisar su situación de pago.', motivo: '[MOCK] Basado en la alerta simulada.' },
                ],
            },
        };
    }
}
