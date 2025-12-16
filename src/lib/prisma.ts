// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';

/**
 * Instância global do Prisma Client
 * Evita múltiplas instâncias em ambiente de desenvolvimento (hot reload)
 */
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

/**
 * Desconecta o Prisma Client ao encerrar o processo
 */
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});