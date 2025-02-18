import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  const nextUrl = requestUrl.searchParams.get('next')

  if (nextUrl) {
    return NextResponse.redirect(requestUrl.origin + nextUrl);
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin)
}