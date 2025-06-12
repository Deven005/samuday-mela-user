export const dynamic = 'force-dynamic';

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Footer from './components/Footer/Footer';
import Header from './components/Header';
import { getAppData } from './utils/utils';
import { ToastContainer } from 'react-toastify/unstyled';
import 'react-toastify/ReactToastify.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Samuday Mela',
  description:
    'A space for **networking, learning, growth, and exciting competitions**. Join us to expand your knowledge and build lifelong connections!',
  applicationName: 'Samuday Mela',
  openGraph: {
    title: 'Samuday Mela',
    description:
      'A space for **networking, learning, growth, and exciting competitions**. Join us to expand your knowledge and build lifelong connections!',
    url: 'https://samuday-mela-user.vercel.app/',
    siteName: 'Samuday Mela',
    images: [
      {
        url: 'https://firebasestorage.googleapis.com/v0/b/samudaymela.appspot.com/o/public%2FAppLogo.png?alt=media&token=c2d303b5-c27f-4bde-a8c4-5bb434c30237',
        width: 1200,
        height: 630,
        alt: 'Samuday Mela Logo',
      },
      {
        url: 'https://firebasestorage.googleapis.com/v0/b/samudaymela.appspot.com/o/public%2FAppLogo.png?alt=media&token=c2d303b5-c27f-4bde-a8c4-5bb434c30237',
        width: 600,
        height: 315,
        alt: 'Samuday Mela Logo',
      },
      {
        url: 'https://firebasestorage.googleapis.com/v0/b/samudaymela.appspot.com/o/public%2FAppLogo.png?alt=media&token=c2d303b5-c27f-4bde-a8c4-5bb434c30237',
        alt: 'Samuday Mela Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  creator: 'Samuday Mela Team',
  robots: 'index, follow',
  keywords: [
    'community',
    'events',
    'collaboration',
    'meetups',
    'social',
    'Samuday',
    'Mela',
    'Samuday Mela',
    'A place to connect, learn, and grow together.',
    'A vibrant space to connect, share, learn, and grow together as a community.',
    '(समुदाय)',
    'समुदाय',
  ],
  icons:
    'https://firebasestorage.googleapis.com/v0/b/samudaymela.appspot.com/o/public%2FAppLogo.png?alt=media&token=c2d303b5-c27f-4bde-a8c4-5bb434c30237',
  other: {
    'fb:app_id': process.env.NEXT_PUBLIC_FB_APP_ID || '',
  },
  facebook: { appId: process.env.NEXT_PUBLIC_FB_APP_ID || '' },
  formatDetection: {
    url: true,
    email: true,
    date: true,
    address: true,
  },
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION },
  twitter: {
    card: 'summary_large_image',
    title: 'Samuday Mela',
    description: 'Discover and explore community posts.',
    images:
      'https://firebasestorage.googleapis.com/v0/b/samudaymela.appspot.com/o/public%2FAppLogo.png?alt=media&token=c2d303b5-c27f-4bde-a8c4-5bb434c30237',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appData = await getAppData();

  return (
    <html lang="en" data-theme="system">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-base-200`}
      >
        <Header appData={appData} />
        <main className="bg-base-200">{children}</main>
        <Footer appData={appData} />

        <ToastContainer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
