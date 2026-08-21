import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === '/login';

  // Forward the cookie to the backend to check validity
  const apiUrl = process.env.API_URL || 'http://localhost:5000/api';
  
  try {
    const res = await fetch(`${apiUrl}/auth/me`, {
      headers: {
        Cookie: request.headers.get('cookie') || ''
      }
    });

    if (res.ok) {
      // User is authenticated
      if (isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      return NextResponse.next();
    }
  } catch (error) {
    // If the backend is completely unreachable, we could decide to fail open or fail closed.
    // For admin security, fail closed (redirect to login or error) is safer.
    console.error('[Middleware] Backend unreachable:', error);
  }

  // Not authenticated
  if (!isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.).*)',
  ],
};
