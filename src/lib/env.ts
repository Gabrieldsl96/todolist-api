// src/lib/env.ts

import dotenv from "dotenv";
dotenv.config();

/**
 * Valida se todas as variáveis de ambiente necessárias estão configuradas
 */
export function validateEnv(): void {
    const requiredEnvVars = [
        'DATABASE_URL',
        'JWT_ACCESS_SECRET',
        'JWT_REFRESH_SECRET',
    ];

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error('❌ Erro: Variáveis de ambiente obrigatórias não configuradas:');
        missingVars.forEach((varName) => {
            console.error(`   - ${varName}`);
        });
        console.error('\n💡 Dica: Copie o arquivo .env.local.example para .env.local e preencha os valores.');
        process.exit(1);
    }

    // Validação de tamanho dos secrets JWT
    const accessSecret = process.env.JWT_ACCESS_SECRET!;
    const refreshSecret = process.env.JWT_REFRESH_SECRET!;

    if (accessSecret.length < 32) {
        console.warn('⚠️  Aviso: JWT_ACCESS_SECRET deve ter no mínimo 32 caracteres para maior segurança');
    }

    if (refreshSecret.length < 32) {
        console.warn('⚠️  Aviso: JWT_REFRESH_SECRET deve ter no mínimo 32 caracteres para maior segurança');
    }

    if (accessSecret === refreshSecret) {
        console.error('❌ Erro: JWT_ACCESS_SECRET e JWT_REFRESH_SECRET devem ser diferentes!');
        process.exit(1);
    }

    console.log('✅ Variáveis de ambiente validadas com sucesso');
}

/**
 * Tipagem para acesso seguro às variáveis de ambiente
 */
export const env = {
    DATABASE_URL: process.env.DATABASE_URL as string,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    PORT: parseInt(process.env.PORT || '4000'),
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
} as const;