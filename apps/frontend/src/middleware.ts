import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes - no auth needed
  const publicRoutes = ['/login', '/public-passport'];
  const isPublic = publicRoutes.some((r) => pathname.startsWith(r));

  if (isPublic) return NextResponse.next();

  // Check for auth token in cookies
  const token = request.cookies.get('auth-token')?.value;

  if (!token && pathname !== '/') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
