import { NextResponse, NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  // List of protected routes
  const protectedRoutes = [
    '/courses',
    '/create-schedule',
    '/saved',
    '/share',
    '/settings',
  ];

  const { pathname } = req.nextUrl;

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Create Supabase client with cookies from request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  // Refresh session and get user
  const { data } = await supabase.auth.getUser();

  const publicAuthRoutes = ['/auth/login', '/auth/register'];

  if (data.user && pathname === '/') {
    return NextResponse.redirect(new URL('/courses', req.nextUrl.origin));
  }

  if (data.user && publicAuthRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/courses', req.nextUrl.origin));
  }

  if (isProtectedRoute && !data.user) {
    const loginUrl = new URL('/auth/login', req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
