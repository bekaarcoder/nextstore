'use server';

import { auth, signIn, signOut } from '@/auth';
import {
    paymentMethodSchema,
    shippingAddressSchema,
    signInFormSchema,
    signUpFormSchema,
} from '../validators';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { hashSync } from 'bcrypt-ts-edge';
import { prisma } from '@/db/prisma';
import { formatError } from '../utils';
import { ShippingAddress } from '@/types';
import { cookies } from 'next/headers';
import { z } from 'zod';

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
    const cookieStore = await cookies();
    cookieStore.delete('sessionCartId');
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

export async function getUserById(userId: string) {
    const user = await prisma.user.findFirst({
        where: {
            id: userId,
        },
    });

    if (!user) throw new Error('User not found');

    return user;
}

export async function updateUserAddress(data: ShippingAddress) {
    try {
        const session = await auth();
        const currentUser = await prisma.user.findFirst({
            where: {
                id: session?.user?.id,
            },
        });

        if (!currentUser) throw new Error('User not found');

        const address = shippingAddressSchema.parse(data);

        await prisma.user.update({
            where: {
                id: currentUser.id,
            },
            data: {
                address,
            },
        });

        return {
            success: true,
            message: 'Address updated successfully',
        };
    } catch (error) {
        return {
            success: false,
            message: formatError(error),
        };
    }
}

export async function updateUserPaymentMethod(
    data: z.infer<typeof paymentMethodSchema>
) {
    try {
        const session = await auth();
        const currentUser = await prisma.user.findFirst({
            where: {
                id: session?.user?.id,
            },
        });

        if (!currentUser) throw new Error('User not found');

        const paymentMethod = paymentMethodSchema.parse(data);

        await prisma.user.update({
            where: {
                id: currentUser.id,
            },
            data: {
                paymentMethod: paymentMethod.type,
            },
        });

        return {
            success: true,
            message: 'Payment method updated',
        };
    } catch (error) {
        return {
            success: false,
            message: formatError(error),
        };
    }
}

export async function updateProfile(user: { name: string; email: string }) {
    try {
        const session = await auth();
        const currentUser = await prisma.user.findFirst({
            where: {
                id: session?.user?.id,
            },
        });

        if (!currentUser) throw new Error('User not found');

        await prisma.user.update({
            where: {
                id: currentUser.id,
            },
            data: {
                name: user.name,
            },
        });

        return {
            success: true,
            message: 'Profile updated successfully',
        };
    } catch (error) {
        return {
            success: false,
            message: formatError(error),
        };
    }
}
