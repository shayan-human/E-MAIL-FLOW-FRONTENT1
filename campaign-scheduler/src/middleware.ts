import { InsforgeMiddleware } from '@insforge/nextjs/middleware';

export default InsforgeMiddleware({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://4njfm5n4.us-east.insforge.app',
    publicRoutes: [
        '/',
        '/auth/callback',
        '/api/auth',
        '/api/auth/(.*)',
        '/api/webhooks/(.*)'
    ],
});

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
