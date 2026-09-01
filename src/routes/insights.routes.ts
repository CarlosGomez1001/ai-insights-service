import { Router } from 'express';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { postCustomerInsight } from '../controllers/insightsController';

const router = Router();

router.post('/insights/customer', apiKeyAuth, postCustomerInsight);

export default router;
