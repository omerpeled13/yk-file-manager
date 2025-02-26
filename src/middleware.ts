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

  const OTP_EXPIRATION_HOURS = 24; // Set expiration time

  function isOtpValid(user: any) {
    const otpVerified = user?.user_metadata?.isOtpVerified;
    if (!otpVerified) return false;
    const otpVerifiedAt = user?.user_metadata?.otpVerifiedAt;
    if (!otpVerifiedAt) return false;

    const verifiedTime = new Date(otpVerifiedAt).getTime();
    const now = new Date().getTime();
    const diffInHours = (now - verifiedTime) / (1000 * 60 * 60); // Convert to hours

    return diffInHours < OTP_EXPIRATION_HOURS;
  }


  const sendCode = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });

      if (error) {
        console.log("Failed to send email:", error.message);
      }
    }
    catch (error) {
      console.log('שגיאה בלתי צפויה בשליחת קוד');
    }
  }

  // Special case for callback URL
  if (req.nextUrl.pathname === ROUTES.AUTH_CALLBACK) {
    return res
  }

  // Check if OTP was verified (store this in the user's metadata)
  if (user && !isOtpValid(user) && req.nextUrl.pathname !== ROUTES.AUTH) {
    await sendCode(user.email!);
    return NextResponse.redirect(new URL(ROUTES.AUTH, req.url));
  }

  // if user is signed in and the current path is /login redirect to /main
  if (user && isOtpValid(user) && (req.nextUrl.pathname === ROUTES.LOGIN || req.nextUrl.pathname === ROUTES.AUTH)) {
    return NextResponse.redirect(new URL(ROUTES.MAIN, req.url))
  }

  // if user is signed in and the current path is / redirect to /main
  if (user && isOtpValid(user) && req.nextUrl.pathname === ROUTES.HOME) {
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