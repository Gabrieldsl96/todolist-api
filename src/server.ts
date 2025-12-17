// src/server.ts

import express, { Request, Response, NextFunction, Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { validateEnv, env } from './lib/env';
import passport from './lib/passport';
import authRoutes from './routes/auth.routes';
import todoRoutes from './routes/todo.routes';

// Carrega variáveis de ambiente
dotenv.config({ path: '.env.local' });

// Valida variáveis de ambiente obrigatórias
validateEnv();

const app: Express = express();
const PORT = env.PORT;

/**
 * Middlewares Globais
 */

// Segurança HTTP headers
app.use(helmet());

// CORS
app.use(
    cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
    })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging de requisições (apenas em desenvolvimento)
if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Passport initialization
app.use(passport.initialize());

/**
 * Health Check
 */
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'API To-Do List está funcionando!',
        timestamp: new Date().toISOString(),
    });
});

/**
 * Rotas da API
 */
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

/**
 * Rota 404 - Not Found
 */
app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada',
        path: req.originalUrl,
    });
});

/**
 * Error Handler Global
 */
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Erro não tratado:', error);

    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: env.NODE_ENV === 'development' ? error.message : undefined,
    });
});

/**
 * Inicia o servidor
 */
if (env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════╗
║   🚀 Servidor rodando em:             ║
║   http://localhost:${PORT}                ║
║                                        ║
║   📝 API To-Do List                   ║
║   🔐 Autenticação: JWT + OAuth        ║
║   🗄️  Banco de Dados: PostgreSQL      ║
╚════════════════════════════════════════╝
    `);
    });
}

export default app;