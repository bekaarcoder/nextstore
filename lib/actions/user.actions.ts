'use server';

import { signIn, signOut } from '@/auth';
import { signInFormSchema, signUpFormSchema } from '../validators';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { hashSync } from 'bcrypt-ts-edge';
import { prisma } from '@/db/prisma';
import { formatError } from '../utils';

// Sign in user with credentials
export async function signInWithCredentials(
    prevState: unknown,
    formData: FormData
) {
    try {
        const user = signInFormSchema.safeParse({
            email: formData.get('email'),
            password: formData.get('password'),
        });

        if (!user.success) {
            return {
                success: false,
                message: 'Please correct the field errors',
                errors: user.error.flatten().fieldErrors,
            };
        }

        await signIn('credentials', user.data);

        return { success: true, message: 'Signed in successfully' };
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }

        return { success: false, message: 'Invalid credentials' };
    }
}

// Sign out user
export async function signOutUser() {
    await signOut();
}

// Sign up user
export async function signUpUser(prevState: unknown, formData: FormData) {
    try {
        const user = signUpFormSchema.safeParse({
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
        });

        if (!user.success) {
            return {
                success: false,
                message: 'Please correct the field errors',
                errors: user.error.flatten().fieldErrors,
            };
        }

        const plainPassword = user.data.password;
        const hashedPassword = hashSync(user.data.password, 10);

        await prisma.user.create({
            data: {
                name: user.data.name,
                email: user.data.email,
                password: hashedPassword,
            },
        });

        await signIn('credentials', {
            email: user.data.email,
            password: plainPassword,
        });

        return { success: true, message: 'Account creation successful' };
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }

        return { success: false, message: formatError(error) };
    }
}
