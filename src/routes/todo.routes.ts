// src/routes/todo.routes.ts

import { Router } from 'express';
import {
    createTodo,
    getTodos,
    getTodoById,
    updateTodo,
    toggleTodoComplete,
    deleteTodo,
    getTodoStats,
} from '../controllers/todo.controller';
import { validate } from '../middleware/validation';
import { authenticateJWT } from '../middleware/auth';
import {
    createTodoSchema,
    updateTodoSchema,
    getTodosQuerySchema,
} from '../validations/schemas';

const router: Router = Router();

// Todas as rotas de To-Do requerem autenticação
router.use(authenticateJWT);

/**
 * GET /api/todos/stats
 * Estatísticas dos To-Dos do usuário
 */
router.get('/stats', getTodoStats);

/**
 * POST /api/todos
 * Cria um novo To-Do
 */
router.post('/', validate(createTodoSchema), createTodo);

/**
 * GET /api/todos
 * Lista todos os To-Dos com filtros e paginação
 */
router.get('/', validate(getTodosQuerySchema, 'query'), getTodos);

/**
 * GET /api/todos/:id
 * Busca um To-Do específico por ID
 */
router.get('/:id', getTodoById);

/**
 * PUT /api/todos/:id
 * Atualiza um To-Do
 */
router.put('/:id', validate(updateTodoSchema), updateTodo);

/**
 * PATCH /api/todos/:id/toggle
 * Marca/desmarca To-Do como completo
 */
router.patch('/:id/toggle', toggleTodoComplete);

/**
 * DELETE /api/todos/:id
 * Deleta um To-Do
 */
router.delete('/:id', deleteTodo);

export default router;