// middleware.ts
import { cookies } from 'next/headers';
import { NextResponse, NextRequest } from 'next/server';

export const config = {
  matcher: [
    '/((?!sign-in|sign-up|_next/static|_next/image|api|favicon.ico|firebase-messaging-sw.js).*)',
  ],
};
const PUBLIC_PATHS = [
  '/sign-in',
  '/sign-up',
  '/auth/forgot-password',
  '/firebase-messaging-sw.js',
  '/about',
  '/contact',
  '/faq',
  '/keys/public.pem',
  '/auth/google/callback',
  '/auth/facebook/callback',
  '/user/',
  '/legal/',
];
const ROOT_PATH = '/';

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  console.log('pathname: ', pathname);

  // 🔓 Skip check for public paths
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/user/') ||
    pathname.startsWith('/legal/')
  ) {
    if (pathname.startsWith('/user/')) {
      const slug = pathname.split('/user/')[1];
      // Optional: deny access to reserved usernames
      const reserved = ['admin', 'profile', 'login', 'signup', 'settings', 'vendor', 'partner'];
      if (reserved.includes(slug)) {
        return NextResponse.redirect(new URL('/404', request.url));
      }
    }
    return NextResponse.next();
  }

  const sessionCookie = (await cookies()).get('session')?.value ?? '';
  // const appCheckToken = request.headers.get('X-Firebase-AppCheck') || '';

  // try {
  //   const res = await fetch(
  //     `${origin}/api/auth/verify-appCheck-token`,
  //     {
  //       method: "POST",
  //       headers: request.headers,
  //     }
  //   );

  // if (!appCheckRes.ok) {
  //   // 🔒 Invalid app check token, redirect to /block
  //   return NextResponse.redirect(new URL('/block', request.url));
  // }
  // } catch (error) {
  //   console.error("❌ Error verifying token:", error);
  //   return NextResponse.redirect(new URL("/blocked", request.url));
  // }

  try {
    let userId = null;
    // 🔐 Verify session cookie via secure API call
    const sessionVerifyRes = await fetch(`${origin}/api/session/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('Authorization')?.replace('Bearer ', '') ?? '',
        session: sessionCookie,
      },
    });
    // verify-appCheck-token

    const resJson = await sessionVerifyRes.json();
    if (resJson.valid) {
      userId = resJson.uid;
    } else if (!resJson.valid && resJson.error.code === 'auth/session-cookie-expired') {
      // const sessionRenewVerifyRes = await fetch(`${origin}/api/session/renew`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: request.headers.get('Authorization')?.replace('Bearer ', '') ?? '',
      //     session: sessionCookie,
      //   },
      // });
    }

    if (!sessionVerifyRes.ok) {
      // ✅ If path is '/', allow access but clean session if invalid
      if (pathname === ROOT_PATH) {
        if (!userId && sessionCookie) {
          // Clear session cookie if it exists but is invalid
          const res = NextResponse.next();
          res.cookies.delete('session');
          return res;
        }

        return NextResponse.next(); // show homepage (login or dashboard)
      }

      // 🔒 All other protected paths
      if (!userId) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.warn('❌ Error verifying session:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
