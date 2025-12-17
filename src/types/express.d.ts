// src/types/express.d.ts

import { User as PrismaUser } from '@prisma/client';

/**
 * Estende as definições de tipos do Express
 * para incluir o usuário autenticado
 */
declare global {
    namespace Express {
        interface User extends Omit<PrismaUser, 'password'> {
            id: string;
            email: string;
            name: string;
            googleId: string | null;
            githubId: string | null;
            avatar: string | null;
            createdAt: Date;
            updatedAt: Date;
        }

        interface Request {
            user?: User;
        }
    }
}

export { };