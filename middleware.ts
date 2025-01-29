import { NextRequest, NextResponse } from 'next/server';
import { authorized } from './lib/utils';
import { auth } from './auth';

export async function middleware(request: NextRequest) {
    const session = await auth();
    const userId = session?.user?.id;

    const response = authorized(request);

    if (response instanceof NextResponse) {
        return response;
    }

    const protectedPaths = [
        /\/profile/,
        /\/user\/(.*)/,
        /\/order\/(.*)/,
        /\/admin/,
    ];

    const { pathname } = request.nextUrl;

    if (!userId && protectedPaths.some((p) => p.test(pathname))) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
}
