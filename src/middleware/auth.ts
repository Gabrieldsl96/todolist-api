// src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { User } from '@prisma/client';

/**
 * Estende o tipo Request do Express para incluir user
 */
declare global {
    namespace Express {
        interface User extends Omit<User, 'password'> { }
    }
}

/**
 * Middleware de autenticação JWT
 * Protege rotas que requerem usuário autenticado
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('jwt', { session: false }, (error: Error, user: User | false) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao autenticar',
                error: error.message,
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido ou expirado',
            });
        }

        req.user = user;
        next();
    })(req, res, next);
};

/**
 * Middleware opcional de autenticação
 * Permite acesso mesmo sem autenticação, mas popula req.user se token válido
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('jwt', { session: false }, (error: Error, user: User | false) => {
        if (user) {
            req.user = user;
        }
        next();
    })(req, res, next);
};