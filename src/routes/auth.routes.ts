// src/routes/auth.routes.ts

import { Router } from 'express';
import passport from 'passport';
import {
    register,
    login,
    refreshAccessToken,
    logout,
    logoutAll,
    getCurrentUser,
} from '../controllers/auth.controller';
import { validate } from '../middleware/validation';
import { authenticateJWT } from '../middleware/auth';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validations/schemas';
import { generateAccessToken, generateRefreshToken, saveRefreshToken } from '../lib/jwt';
import { env } from '../lib/env';

const router: Router = Router();
/**
 * POST /api/auth/register
 * Registra novo usuário
 */
router.post('/register', validate(registerSchema), register);

/**
 * POST /api/auth/login
 * Login com email e senha
 */
router.post('/login', validate(loginSchema), login);

/**
 * POST /api/auth/refresh
 * Atualiza access token usando refresh token
 */
router.post('/refresh', validate(refreshTokenSchema), refreshAccessToken);

/**
 * POST /api/auth/logout
 * Logout (remove refresh token específico)
 */
router.post('/logout', validate(refreshTokenSchema), logout);

/**
 * POST /api/auth/logout-all
 * Logout de todos os dispositivos
 */
router.post('/logout-all', authenticateJWT, logoutAll);

/**
 * GET /api/auth/me
 * Retorna dados do usuário autenticado
 */
router.get('/me', authenticateJWT, getCurrentUser);

/**
 * GET /api/auth/google
 * Inicia autenticação com Google
 */
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
    })
);

/**
 * GET /api/auth/google/callback
 * Callback do Google OAuth
 */
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    async (req, res) => {
        try {
            if (!req.user) {
                return res.redirect(`${env.FRONTEND_URL}/login?error=auth_failed`);
            }

            // Gera tokens
            const accessToken = generateAccessToken({
                userId: req.user.id,
                email: req.user.email,
            });
            const refreshToken = generateRefreshToken({
                userId: req.user.id,
                email: req.user.email,
            });

            // Salva refresh token
            await saveRefreshToken(req.user.id, refreshToken);

            // Redireciona para o frontend com tokens
            return res.redirect(
                `${env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
            );
        } catch (error) {
            console.error('Erro no callback do Google:', error);
            return res.redirect(`${env.FRONTEND_URL}/login?error=server_error`);
        }
    }
);

/**
 * GET /api/auth/github
 * Inicia autenticação com GitHub
 */
router.get(
    '/github',
    passport.authenticate('github', {
        scope: ['user:email'],
        session: false,
    })
);

/**
 * GET /api/auth/github/callback
 * Callback do GitHub OAuth
 */
router.get(
    '/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    async (req, res) => {
        try {
            if (!req.user) {
                return res.redirect(`${env.FRONTEND_URL}/login?error=auth_failed`);
            }

            // Gera tokens
            const accessToken = generateAccessToken({
                userId: req.user.id,
                email: req.user.email,
            });
            const refreshToken = generateRefreshToken({
                userId: req.user.id,
                email: req.user.email,
            });

            // Salva refresh token
            await saveRefreshToken(req.user.id, refreshToken);

            // Redireciona para o frontend com tokens
            return res.redirect(
                `${env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
            );
        } catch (error) {
            console.error('Erro no callback do GitHub:', error);
            return res.redirect(`${env.FRONTEND_URL}/login?error=server_error`);
        }
    }
);

export default router;