import type { NextFunction, Request, Response } from 'express';
import { generateCustomerInsight } from '../services/insights/customerInsightService';

export const postCustomerInsight = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = await generateCustomerInsight(req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
