// /api/contact/route.ts
import { serverFirestore } from '@/app/config/firebase.server.config';
import { parseError } from '@/app/utils/utils';
import { Timestamp } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Ensure this runs in Node.js

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/contact', req.url));

  try {
    const formData = await req.formData();
    const name = formData.get('name')?.toString().trim();
    const email = formData.get('email')?.toString().trim();
    const message = formData.get('message')?.toString().trim();

    // Validation
    if (!name || !email || !message) {
      res.cookies.set('contactError', 'All fields are required', { maxAge: 5, path: '/contact' });
      return res;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.cookies.set('contactError', 'Invalid email', { maxAge: 5, path: '/contact' });
      return res;
    }
    // const token = formData.get('g-recaptcha-response') as string;

    const ip = req.headers.get('x-forwarded-for')?.toString().split(',')[0] || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // const isHuman = await verifyRecaptcha(token, ip.toString());

    // if (!isHuman) {
    //   throw { message: 'reCAPTCHA failed' };
    // }

    await serverFirestore.collection('contactMessages').add({
      name,
      email,
      message,
      createdAt: Timestamp.now(),
      status: 'new',
      ip,
      userAgent,
    });

    // Redirect on success
    res.cookies.set('contactSuccess', '1', { maxAge: 5, path: '/contact' });
    return res;
  } catch (error) {
    const err = parseError(error);
    console.error('❌ Contact form error:', error);

    // Fallback redirect on error
    res.cookies.set('contactError', err.message, {
      maxAge: 5,
      path: '/contact',
    });
    return res;
  }
}
