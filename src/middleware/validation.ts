// src/middleware/validation.ts

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Middleware genérico de validação com Zod
 */
export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
    return (req: Request, res: Response, next: NextFunction): Response | void => {
        try {
            // Valida os dados com o schema Zod
            const data = req[source];
            const validated = schema.parse(data);

            // Substitui os dados originais pelos validados
            req[source] = validated;

            next();
        } catch (error: any) {
            // Retorna erros de validação formatados
            return res.status(400).json({
                success: false,
                message: 'Erro de validação',
                errors: error.errors?.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
        }
    };
};