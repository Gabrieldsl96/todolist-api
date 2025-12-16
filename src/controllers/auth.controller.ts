// src/controllers/auth.controller.ts

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import {
    generateAccessToken,
    generateRefreshToken,
    saveRefreshToken,
    verifyRefreshToken,
    deleteRefreshToken,
    deleteAllRefreshTokens,
    refreshTokenExists,
} from '../lib/jwt';
import { RegisterInput, LoginInput, RefreshTokenInput } from '../validations/schemas';

/**
 * Registro de novo usuário
 */
export async function register(req: Request<{}, {}, RegisterInput>, res: Response) {
    try {
        const { email, name, password } = req.body;

        // Verifica se usuário já existe
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email já cadastrado',
            });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 12);

        // Cria usuário
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                createdAt: true,
            },
        });

        // Gera tokens
        const accessToken = generateAccessToken({ userId: user.id, email: user.email });
        const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

        // Salva refresh token
        await saveRefreshToken(user.id, refreshToken);

        return res.status(201).json({
            success: true,
            message: 'Usuário criado com sucesso',
            data: {
                user,
                accessToken,
                refreshToken,
            },
        });
    } catch (error: any) {
        console.error('Erro ao registrar usuário:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao registrar usuário',
            error: error.message,
        });
    }
}

/**
 * Login de usuário
 */
export async function login(req: Request<{}, {}, LoginInput>, res: Response) {
    try {
        const { email, password } = req.body;

        // Busca usuário
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.password) {
            return res.status(401).json({
                success: false,
                message: 'Email ou senha incorretos',
            });
        }

        // Verifica senha
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email ou senha incorretos',
            });
        }

        // Gera tokens
        const accessToken = generateAccessToken({ userId: user.id, email: user.email });
        const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

        // Salva refresh token
        await saveRefreshToken(user.id, refreshToken);

        return res.status(200).json({
            success: true,
            message: 'Login realizado com sucesso',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error: any) {
        console.error('Erro ao fazer login:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao fazer login',
            error: error.message,
        });
    }
}

/**
 * Refresh de access token
 */
export async function refreshAccessToken(req: Request<{}, {}, RefreshTokenInput>, res: Response) {
    try {
        const { refreshToken } = req.body;

        // Verifica se refresh token existe no banco
        const tokenExists = await refreshTokenExists(refreshToken);

        if (!tokenExists) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token inválido ou expirado',
            });
        }

        // Verifica e decodifica refresh token
        const payload = verifyRefreshToken(refreshToken);

        // Gera novo access token
        const newAccessToken = generateAccessToken({
            userId: payload.userId,
            email: payload.email,
        });

        return res.status(200).json({
            success: true,
            message: 'Token atualizado com sucesso',
            data: {
                accessToken: newAccessToken,
            },
        });
    } catch (error: any) {
        console.error('Erro ao atualizar token:', error);
        return res.status(401).json({
            success: false,
            message: 'Refresh token inválido ou expirado',
            error: error.message,
        });
    }
}

/**
 * Logout (remove refresh token)
 */
export async function logout(req: Request<{}, {}, RefreshTokenInput>, res: Response) {
    try {
        const { refreshToken } = req.body;

        await deleteRefreshToken(refreshToken);

        return res.status(200).json({
            success: true,
            message: 'Logout realizado com sucesso',
        });
    } catch (error: any) {
        console.error('Erro ao fazer logout:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao fazer logout',
            error: error.message,
        });
    }
}

/**
 * Logout de todos os dispositivos
 */
export async function logoutAll(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado',
            });
        }

        await deleteAllRefreshTokens(req.user.id);

        return res.status(200).json({
            success: true,
            message: 'Logout realizado em todos os dispositivos',
        });
    } catch (error: any) {
        console.error('Erro ao fazer logout em todos dispositivos:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao fazer logout',
            error: error.message,
        });
    }
}

/**
 * Retorna dados do usuário autenticado
 */
export async function getCurrentUser(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado',
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                user: {
                    id: req.user.id,
                    email: req.user.email,
                    name: req.user.name,
                    avatar: req.user.avatar,
                },
            },
        });
    } catch (error: any) {
        console.error('Erro ao buscar usuário:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar usuário',
            error: error.message,
        });
    }
}