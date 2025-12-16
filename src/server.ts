// src/server.ts

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import passport from './lib/passport';
import authRoutes from './routes/auth.routes';
import todoRoutes from './routes/todo.routes';

// Carrega variáveis de ambiente
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 4000;

/**
 * Middlewares Globais
 */

// Segurança HTTP headers
app.use(helmet());

// CORS
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging de requisições (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Passport initialization
app.use(passport.initialize());

/**
 * Health Check
 */
app.get('/health', (req: Request, res: Response) => {
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
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Erro não tratado:', error);

    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
});

/**
 * Inicia o servidor
 */
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   🚀 Servidor rodando em:             ║
║   http://localhost:${PORT}             ║
║                                        ║
║   📝 API To-Do List                   ║
║   🔐 Autenticação: JWT + OAuth        ║
║   🗄️  Banco de Dados: PostgreSQL      ║
╚════════════════════════════════════════╝
  `);
});

export default app;