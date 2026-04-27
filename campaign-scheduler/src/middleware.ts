import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    // NUCLEAR OPTION: NO SECURITY
    // Allow all requests to pass through to the app without any checks.
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
