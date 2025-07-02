import { auth } from '@/lib/auth';

export default auth((req) => {
  // List of protected routes
  const protectedRoutes = [
    '/courses',
    '/create-schedule',
    '/saved',
    '/settings',
  ];

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  // If accessing protected route without auth, redirect to login
  if (isProtectedRoute && !req.auth) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
