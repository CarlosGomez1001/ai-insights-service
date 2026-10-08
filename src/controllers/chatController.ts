import type { NextFunction, Request, Response } from 'express';
import { generateCustomerChat } from '../services/chat/customerChatService';

export const postCustomerChat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = await generateCustomerChat(req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
