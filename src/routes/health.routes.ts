import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'ai-service', uptime: process.uptime() });
});

export default router;
