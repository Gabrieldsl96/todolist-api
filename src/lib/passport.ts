// src/lib/passport.ts

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import bcrypt from 'bcrypt';
import { prisma } from './prisma';
import { env } from './env';
import { JwtPayload } from './jwt';

/**
 * Estratégia Local - Login com email e senha
 */
passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
        },
        async (email, password, done) => {
            try {
                // Busca usuário pelo email
                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user || !user.password) {
                    return done(null, false, { message: 'Email ou senha incorretos' });
                }

                // Verifica senha
                const isPasswordValid = await bcrypt.compare(password, user.password);

                if (!isPasswordValid) {
                    return done(null, false, { message: 'Email ou senha incorretos' });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

/**
 * Estratégia JWT - Proteção de rotas
 */
passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: env.JWT_ACCESS_SECRET,
        },
        async (payload: JwtPayload, done) => {
            try {
                const user = await prisma.user.findUnique({
                    where: { id: payload.userId },
                });

                if (!user) {
                    return done(null, false);
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

/**
 * Estratégia Google OAuth2
 */
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: env.GOOGLE_CLIENT_ID,
                clientSecret: env.GOOGLE_CLIENT_SECRET,
                callbackURL: env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
            },
            async (_accessToken, _refreshToken, profile, done) => {
                try {
                    // Verifica se usuário já existe
                    let user = await prisma.user.findUnique({
                        where: { googleId: profile.id },
                    });

                    if (!user) {
                        // Cria novo usuário
                        user = await prisma.user.create({
                            data: {
                                googleId: profile.id,
                                email: profile.emails?.[0]?.value || '',
                                name: profile.displayName || 'Usuário Google',
                                avatar: profile.photos?.[0]?.value,
                            },
                        });
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error as Error);
                }
            }
        )
    );
}

/**
 * Estratégia GitHub OAuth2
 */
if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    passport.use(
        new GitHubStrategy(
            {
                clientID: env.GITHUB_CLIENT_ID,
                clientSecret: env.GITHUB_CLIENT_SECRET,
                callbackURL: env.GITHUB_CALLBACK_URL || 'http://localhost:4000/api/auth/github/callback',
            },
            async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
                try {
                    // Verifica se usuário já existe
                    let user = await prisma.user.findUnique({
                        where: { githubId: profile.id },
                    });

                    if (!user) {
                        // Cria novo usuário
                        user = await prisma.user.create({
                            data: {
                                githubId: profile.id,
                                email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
                                name: profile.displayName || profile.username || 'Usuário GitHub',
                                avatar: profile.photos?.[0]?.value,
                            },
                        });
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );
}

export default passport;