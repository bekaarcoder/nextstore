import { NextRequest, NextResponse } from 'next/server';
import { authorized } from './lib/utils';

export async function middleware(request: NextRequest) {
    const response = authorized(request);

    if (response instanceof NextResponse) {
        return response;
    }

    return NextResponse.next();
}
