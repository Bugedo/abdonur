import { type NextRequest, NextResponse } from 'next/server';
import { TESTING_MODE } from '@/lib/adminTestingMode';

export async function middleware(request: NextRequest) {
  if (TESTING_MODE) {
    // En modo testing, dejar pasar todo sin auth
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;

  // /admin funciona como pantalla de login.
  if (pathname === '/admin') {
    return NextResponse.next();
  }

  // Proteger el resto del panel admin.
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
