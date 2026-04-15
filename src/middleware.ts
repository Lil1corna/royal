import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  void request
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
