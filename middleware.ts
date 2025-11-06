import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Protect /admin pages with cookie-based session; allow /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const cookie = request.cookies.get('admin_session')?.value;
    if (cookie !== '1') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};



