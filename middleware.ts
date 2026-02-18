import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // Add security headers (these supplement next.config.ts headers)
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  
  // Add performance hints
  response.headers.set('X-Response-Time', Date.now().toString());

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}