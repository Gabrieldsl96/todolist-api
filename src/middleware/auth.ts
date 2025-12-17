// src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

/**
 * Middleware de autenticação JWT
 * Protege rotas que requerem usuário autenticado
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
    passport.authenticate('jwt', { session: false }, (err: any, user: Express.User | false): void => {
        if (err) {
            res.status(500).json({
                success: false,
                message: 'Erro ao autenticar',
                error: err?.message || 'Erro desconhecido',
            });
            return;
        }

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Token inválido ou expirado',
            });
            return;
        }

        req.user = user;
        next();
    })(req, res, next);
};

/**
 * Middleware opcional de autenticação
 * Permite acesso mesmo sem autenticação, mas popula req.user se token válido
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    passport.authenticate('jwt', { session: false }, (_err: any, user: Express.User | false): void => {
        if (user) {
            req.user = user;
        }
        next();
    })(req, res, next);
};