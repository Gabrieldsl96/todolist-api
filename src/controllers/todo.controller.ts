// src/controllers/todo.controller.ts

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { CreateTodoInput, UpdateTodoInput, GetTodosQuery } from '../validations/schemas';

/**
 * Cria um novo To-Do
 */
export async function createTodo(req: Request<{}, {}, CreateTodoInput>, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado',
            });
        }

        const { title, description, priority, dueDate } = req.body;

        const todo = await prisma.todo.create({
            data: {
                title,
                description,
                priority,
                dueDate: dueDate ? new Date(dueDate) : null,
                userId: req.user.id,
            },
        });

        return res.status(201).json({
            success: true,
            message: 'To-Do criado com sucesso',
            data: { todo },
        });
    } catch (error: any) {
        console.error('Erro ao criar To-Do:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao criar To-Do',
            error: error.message,
        });
    }
}

/**
 * Lista todos os To-Dos do usuário com filtros e paginação
 */
export async function getTodos(req: Request<{}, {}, {}, GetTodosQuery>, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado',
            });
        }

        const { completed, priority, search, page, limit } = req.query;

        // Converte page e limit para números
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Constrói filtros dinamicamente
        const where: any = {
            userId: req.user.id,
        };

        if (completed !== undefined) {
            where.completed = completed === 'true';
        }

        if (priority) {
            where.priority = priority;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Busca To-Dos com paginação
        const [todos, total] = await Promise.all([
            prisma.todo.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: [
                    { completed: 'asc' }, // Não completados primeiro
                    { dueDate: 'asc' }, // Por data de vencimento
                    { createdAt: 'desc' }, // Mais recentes primeiro
                ],
            }),
            prisma.todo.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limitNum);

        return res.status(200).json({
            success: true,
            data: {
                todos,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages,
                    hasNext: pageNum < totalPages,
                    hasPrev: pageNum > 1,
                },
            },
        });
    } catch (error: any) {
        console.error('Erro ao listar To-Dos:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao listar To-Dos',
            error: error.message,
        });
    }
}

/**
 * Busca um To-Do específico por ID
 */
export async function getTodoById(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado',
            });
        }

        const { id } = req.params;

        const todo = await prisma.todo.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
        });

        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'To-Do não encontrado',
            });
        }

        return res.status(200).json({
            success: true,
            data: { todo },
        });
    } catch (error: any) {
        console.error('Erro ao buscar To-Do:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar To-Do',
            error: error.message,
        });
    }
}

/**
 * Atualiza um To-Do
 */
export async function updateTodo(req: Request<{ id: string }, {}, UpdateTodoInput>, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado',
            });
        }

        const { id } = req.params;
        const { title, description, completed, priority, dueDate } = req.body;

        // Verifica se To-Do existe e pertence ao usuário
        const existingTodo = await prisma.todo.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
        });

        if (!existingTodo) {
            return res.status(404).json({
                success: false,
                message: 'To-Do não encontrado',
            });
        }

        // Atualiza To-Do
        const todo = await prisma.todo.update({
            where: { id },
            data: {
                title,
                description,
                completed,
                priority,
                dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
            },
        });

        return res.status(200).json({
            success: true,
            message: 'To-Do atualizado com sucesso',
            data: { todo },
        });
    } catch (error: any) {
        console.error('Erro ao atualizar To-Do:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao atualizar To-Do',
            error: error.message,
        });
    }
}

/**
 * Marca/desmarca To-Do como completo
 */
export async function toggleTodoComplete(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado',
            });
        }

        const { id } = req.params;

        // Busca To-Do atual
        const existingTodo = await prisma.todo.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
        });

        if (!existingTodo) {
            return res.status(404).json({
                success: false,
                message: 'To-Do não encontrado',
            });
        }

        // Toggle completed
        const todo = await prisma.todo.update({
            where: { id },
            data: {
                completed: !existingTodo.completed,
            },
        });

        return res.status(200).json({
            success: true,
            message: `To-Do marcado como ${todo.completed ? 'completo' : 'incompleto'}`,
            data: { todo },
        });
    } catch (error: any) {
        console.error('Erro ao atualizar status do To-Do:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao atualizar status do To-Do',
            error: error.message,
        });
    }
}

/**
 * Deleta um To-Do
 */
export async function deleteTodo(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado',
            });
        }

        const { id } = req.params;

        // Verifica se To-Do existe e pertence ao usuário
        const existingTodo = await prisma.todo.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
        });

        if (!existingTodo) {
            return res.status(404).json({
                success: false,
                message: 'To-Do não encontrado',
            });
        }

        // Deleta To-Do
        await prisma.todo.delete({
            where: { id },
        });

        return res.status(200).json({
            success: true,
            message: 'To-Do deletado com sucesso',
        });
    } catch (error: any) {
        console.error('Erro ao deletar To-Do:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao deletar To-Do',
            error: error.message,
        });
    }
}

/**
 * Estatísticas dos To-Dos do usuário
 */
export async function getTodoStats(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado',
            });
        }

        const [total, completed, pending, overdue] = await Promise.all([
            prisma.todo.count({
                where: { userId: req.user.id },
            }),
            prisma.todo.count({
                where: {
                    userId: req.user.id,
                    completed: true,
                },
            }),
            prisma.todo.count({
                where: {
                    userId: req.user.id,
                    completed: false,
                },
            }),
            prisma.todo.count({
                where: {
                    userId: req.user.id,
                    completed: false,
                    dueDate: {
                        lt: new Date(),
                    },
                },
            }),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                stats: {
                    total,
                    completed,
                    pending,
                    overdue,
                    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
                },
            },
        });
    } catch (error: any) {
        console.error('Erro ao buscar estatísticas:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar estatísticas',
            error: error.message,
        });
    }
}