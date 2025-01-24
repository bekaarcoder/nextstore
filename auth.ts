import { prisma } from '@/db/prisma';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { compareSync } from 'bcrypt-ts-edge';
import type { NextAuthConfig } from 'next-auth';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextResponse } from 'next/server';

export const config = {
    pages: {
        signIn: '/sign-in',
        error: '/sign-in',
    },
    session: {
        strategy: 'jwt',
        maxAge: 1 * 24 * 60 * 60, // 1 day
    },
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            credentials: {
                email: { type: 'email' },
                password: { type: 'password' },
            },
            async authorize(credentials) {
                if (credentials == null) return null;

                // Find user in database
                const user = await prisma.user.findFirst({
                    where: {
                        email: credentials.email as string,
                    },
                });

                // Check if user exists and password matches
                if (user && user.password) {
                    const isMatch = compareSync(
                        credentials.password as string,
                        user.password
                    );

                    // If password matched, return user
                    if (isMatch) {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                        };
                    }
                }

                // If user does not exist or password does not match, return null
                return null;
            },
        }),
    ],
    callbacks: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async session({ session, user, trigger, token }: any) {
            // Set user id from token
            session.user.id = token.sub;
            session.user.role = token.role;
            session.user.name = token.name;

            // If there is an update, set the user name
            if (trigger === 'update') {
                session.user.name = user.name;
            }

            return session;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        async jwt({ token, user, trigger, session }: any) {
            // Assign user fields to token
            if (user) {
                token.role = user.role;

                // If user has no name, then user email
                if (user.name === 'NO_NAME') {
                    token.name = user.email.split('@')[0];

                    // Update the database to reflect the token name
                    await prisma.user.update({
                        where: {
                            id: user.id,
                        },
                        data: {
                            name: token.name,
                        },
                    });
                }
            }
            return token;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        authorized({ request, auth }: any) {
            // check for session cart cookie
            if (!request.cookies.get('sessionCartId')) {
                // generate new session cart id cookie
                const sessionCartId = crypto.randomUUID();

                // clone the request headers
                const newRequestHeaders = new Headers(request.headers);

                // create new response and add the new header
                const response = NextResponse.next({
                    request: {
                        headers: newRequestHeaders,
                    },
                });

                // Set newly generated sessionCartId in the response cookies
                response.cookies.set('sessionCartId', sessionCartId);
                return response;
            } else {
                return true;
            }
        },
    },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
