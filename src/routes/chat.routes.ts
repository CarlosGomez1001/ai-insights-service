import { Router } from 'express';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { postCustomerChat } from '../controllers/chatController';

const router = Router();

router.post('/chat/customer', apiKeyAuth, postCustomerChat);

export default router;
