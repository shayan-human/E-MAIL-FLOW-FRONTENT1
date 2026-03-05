import { InsforgeMiddleware } from '@insforge/nextjs/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Use a standard session cookie check for fast redirect in middleware
    const hasSession =
        request.cookies.has('insforge_session') ||
        request.cookies.has('__client_id'); // Some common session indicators

    if (pathname === '/' && hasSession) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return InsforgeMiddleware({
        baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://4njfm5n4.us-east.insforge.app',
        publicRoutes: [
            '/',
            '/auth/callback',
            '/api/auth',
            '/api/auth/(.*)',
            '/api/webhooks/(.*)'
        ],
    })(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - svg, png, jpg, jpeg, gif, webp (images)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
