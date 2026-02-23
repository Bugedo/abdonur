import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabaseAuthMiddleware';
import { TESTING_MODE } from '@/lib/adminTestingMode';

export async function middleware(request: NextRequest) {
  if (TESTING_MODE) {
    // En modo testing, dejar pasar todo sin auth
    return NextResponse.next();
  }
  return await updateSession(request);
}

export const config = {
  matcher: ['/admin/:path*'],
};
