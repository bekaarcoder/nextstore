import { clsx, type ClassValue } from 'clsx';
import { NextRequest, NextResponse } from 'next/server';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// convert prisma object into a regular JS object
export function convertToPlainObject<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

// Format number with decimal places
export function formatNumberWithDecimal(num: number): string {
    const [int, decimal] = num.toString().split('.');
    return decimal ? `${int}.${decimal.padEnd(2, '0')}` : `${int}.00`;
}

// Format errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function formatError(error: any) {
    if (error.name === 'ZodError') {
        const fieldErrors = Object.keys(error.errors).map(
            (field) => error.errors[field].message
        );
        return fieldErrors.join('. ');
    } else if (
        error.name === 'PrismaClientKnownRequestError' &&
        error.code === 'P2002'
    ) {
        const field = error.meta?.target ? error.meta.target[0] : 'Field';
        return `${
            field.charAt(0).toUpperCase() + field.slice(1)
        } already exists`;
    } else {
        return typeof error.message === 'string'
            ? error.message
            : JSON.stringify(error.message);
    }
}

// Round number to 2 decimal places
export function round2(value: number | string) {
    if (typeof value === 'number') {
        return Math.round((value + Number.EPSILON) * 100) / 100;
    } else if (typeof value === 'string') {
        return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
    } else {
        throw new Error('Invalid value');
    }
}

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
    minimumFractionDigits: 2,
});

export function formatCurrency(amount: string | number | null) {
    if (typeof amount === 'number') {
        return CURRENCY_FORMATTER.format(amount);
    } else if (typeof amount === 'string') {
        return CURRENCY_FORMATTER.format(Number(amount));
    } else {
        return 'NaN';
    }
}

export function authorized(request: NextRequest) {
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
    }
    return true;
}
