import { type NextRequest, NextResponse } from 'next/server';
import { TESTING_MODE } from '@/lib/adminTestingMode';

export async function middleware(request: NextRequest) {
  if (TESTING_MODE) {
    // In testing mode, skip auth for all admin routes
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;

  // /admin is the login screen
  if (pathname === '/admin') {
    return NextResponse.next();
  }

  // Protect the rest of the admin panel
  if (pathname.startsWith('/admin')) {
    const hasSession = Boolean(request.cookies.get('abdonur_admin_session')?.value);
    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
