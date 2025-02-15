import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

import { NextRequest } from 'next/server'
import { ROUTES, isUnprotectedRoute } from '@/src/constants'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Special case for callback URL
  if (req.nextUrl.pathname === ROUTES.AUTH_CALLBACK) {
    return res
  }

  // if user is signed in and the current path is /login redirect to /main
  if (user && req.nextUrl.pathname === ROUTES.LOGIN) {
    return NextResponse.redirect(new URL(ROUTES.MAIN, req.url))
  }

  // if user is signed in and the current path is / redirect to /main
  if (user && req.nextUrl.pathname === ROUTES.HOME) {
    return NextResponse.redirect(new URL(ROUTES.MAIN, req.url))
  }

  // if user is not signed in and the current path is not protected, allow access
  if (!user && !isUnprotectedRoute(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}