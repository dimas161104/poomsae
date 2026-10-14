import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Session cookies
  const adminSession = request.cookies.get('admin_session')?.value;
  const operatorSession = request.cookies.get('operator_session')?.value;
  const judgeSession = request.cookies.get('judge_session')?.value;
  const monitorSession = request.cookies.get('monitor_session')?.value;

  // RBAC route protection
  if (path.startsWith('/admin')) {
    if (!adminSession) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (path.startsWith('/operator')) {
    if (!operatorSession && !adminSession) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (path.startsWith('/juri')) {
    if (!judgeSession && !adminSession) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/operator/:path*',
    '/juri/:path*',
  ],
};
