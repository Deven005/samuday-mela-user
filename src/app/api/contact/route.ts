// /api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Ensure this runs in Node.js

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get('name')?.toString().trim();
    const email = formData.get('email')?.toString().trim();
    const message = formData.get('message')?.toString().trim();

    // Validation
    if (!name || !email || !message) {
      return NextResponse.redirect(
        new URL('/contact?error=All fields required', req.url), // Absolute URL needed here
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.redirect(
        new URL('/contact?error=Invalid email', req.url), // Absolute URL needed here
      );
    }

    console.log('📥 Contact submission:', { name, email, message });

    // Redirect on success
    return NextResponse.redirect(new URL('/contact?success=true', req.url));
  } catch (error) {
    console.error('❌ Contact form error:', error);

    // Fallback redirect on error
    return NextResponse.redirect(
      new URL('/contact?error=Server+error+please+try+again', req.url), // Absolute URL needed here
    );
  }
}
