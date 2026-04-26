import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
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
    const isPublicRoute = 
        pathname === '/' || 
        pathname === '/auth/signin' || 
        pathname === '/auth/signup';

    const isAuthPath = pathname.startsWith('/auth/');

    // Get session once
    const { data: { session } } = await supabase.auth.getSession();

    // 1. If trying to access protected route without session -> Sign In
    if (!session && !isPublicRoute && !isAuthPath) {
        const signInUrl = new URL('/auth/signin', request.url);
        signInUrl.searchParams.set('reason', 'session_expired');
        return NextResponse.redirect(signInUrl);
    }

    // 2. If already logged in and hitting Sign In/Sign Up/Landing -> Dashboard
    if (session && isPublicRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
