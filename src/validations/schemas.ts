// src/validations/schemas.ts

import { z } from 'zod';

/**
 * Schema de Registro de Usuário
 */
export const registerSchema = z.object({
    email: z.string().email('Email inválido'),
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

/**
 * Schema de Login
 */
export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Senha é obrigatória'),
});

/**
 * Schema de Refresh Token
 */
export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

/**
 * Schema de Criação de To-Do
 */
export const createTodoSchema = z.object({
    title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
    description: z.string().max(1000, 'Descrição muito longa').optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    dueDate: z.string().datetime().optional(),
});

/**
 * Schema de Atualização de To-Do
 */
export const updateTodoSchema = z.object({
    title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo').optional(),
    description: z.string().max(1000, 'Descrição muito longa').optional().nullable(),
    completed: z.boolean().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    dueDate: z.string().datetime().optional().nullable(),
});

/**
 * Schema de Query para listagem de To-Dos
 */
export const getTodosQuerySchema = z.object({
    completed: z.enum(['true', 'false']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    search: z.string().optional(),
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('10'),
});

/**
 * Tipos TypeScript extraídos dos schemas
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type GetTodosQuery = z.infer<typeof getTodosQuerySchema>;