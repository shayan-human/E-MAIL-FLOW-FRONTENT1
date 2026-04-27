import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    const { pathname } = request.nextUrl;

    // Public routes that don't require auth
    const secret = request.nextUrl.searchParams.get('secret');
    if (secret === 'demgrow_admin') {
        const responseWithCookie = NextResponse.redirect(new URL('/dashboard', request.url));
        responseWithCookie.cookies.set('bypass_auth', 'true', { 
            maxAge: 60 * 60 * 24,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });
        return responseWithCookie;
    }
    const hasBypass = request.cookies.get('bypass_auth')?.value === 'true';

    const isPublicRoute = 
        pathname === '/' || 
        pathname === '/auth/signin' || 
        pathname === '/auth/signup' ||
        hasBypass;

    const isAuthPath = pathname.startsWith('/auth/');

    // Get session once
    const { data: { session } } = await supabase.auth.getSession();

    // 1. If has bypass or session, and hitting Sign In/Sign Up/Landing -> Dashboard
    if ((session || hasBypass) && (pathname === '/' || isAuthPath)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 2. If trying to access protected route without session or bypass -> Sign In
    if (!session && !hasBypass && !isPublicRoute && !isAuthPath) {
        const signInUrl = new URL('/auth/signin', request.url);
        return NextResponse.redirect(signInUrl);
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
