// src/lib/jwt.ts

import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

/**
 * Payload do JWT
 */
export interface JwtPayload {
    userId: string;
    email: string;
}

/**
 * Gera um Access Token (curta duração - 15 minutos)
 */
export function generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });
}

/**
 * Gera um Refresh Token (longa duração - 7 dias)
 */
export function generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });
}

/**
 * Verifica e decodifica um Access Token
 */
export function verifyAccessToken(token: string): JwtPayload {
    try {
        return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
    } catch (error) {
        throw new Error('Token inválido ou expirado');
    }
}

/**
 * Verifica e decodifica um Refresh Token
 */
export function verifyRefreshToken(token: string): JwtPayload {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
    } catch (error) {
        throw new Error('Refresh token inválido ou expirado');
    }
}

/**
 * Salva um Refresh Token no banco de dados
 */
export async function saveRefreshToken(userId: string, token: string): Promise<void> {
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    const expiresInMs = parseExpiration(expiresIn);
    const expiresAt = new Date(Date.now() + expiresInMs);

    await prisma.refreshToken.create({
        data: {
            token,
            userId,
            expiresAt,
        },
    });
}

/**
 * Remove um Refresh Token específico (logout)
 */
export async function deleteRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.delete({
        where: { token },
    });
}

/**
 * Remove todos os Refresh Tokens de um usuário (logout de todos os dispositivos)
 */
export async function deleteAllRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
        where: { userId },
    });
}

/**
 * Verifica se um Refresh Token existe no banco
 */
export async function refreshTokenExists(token: string): Promise<boolean> {
    const refreshToken = await prisma.refreshToken.findUnique({
        where: { token },
    });
    return !!refreshToken && refreshToken.expiresAt > new Date();
}

/**
 * Converte string de expiração para milissegundos
 */
function parseExpiration(exp: string): number {
    const unit = exp.slice(-1);
    const value = parseInt(exp.slice(0, -1));

    const units: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    return value * (units[unit] || 1000);
}