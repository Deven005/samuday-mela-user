import Link from 'next/link';
import { DocumentData } from 'firebase-admin/firestore';
import FooterClient from './FooterClient';
import { getUserData } from '@/app/utils/utils';

interface FooterPropType {
  appData: DocumentData | undefined;
}

const Footer = async ({ appData }: FooterPropType) => {
  const user = await getUserData();
  return (
    <>
      <FooterClient />

      <footer className="bg-base-200 text-base-content py-12 mt-auto border-t border-base-300 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start justify-between gap-12">
          {/* 🔥 Welcome / App Info */}
          <div className="text-center md:text-left max-w-md">
            <h3 className="text-3xl font-extrabold bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 text-transparent bg-clip-text">
              {user ? '👋 Hey there!' : `🚀 Welcome to ${appData?.appName}`}
            </h3>
            <p className="mt-3 text-sm text-base-content/70">
              {appData?.description || 'Join challenges, meet creators, and spark your creativity.'}
            </p>
            <Link
              href={user ? '/' : '/join'}
              className="btn mt-4 px-6 py-2 text-sm rounded-full shadow-md hover:scale-105 transition-transform bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white border-none"
            >
              {user ? 'Go to Dashboard' : 'Join Now 🚀'}
            </Link>
          </div>

          {/* 🌍 Explore */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold mb-3">Explore 🌐</h4>
            <ul className="space-y-2 text-sm">
              {['about', 'events', 'networking', 'resources', 'contact', 'faq'].map((page) => (
                <li key={page}>
                  <Link
                    href={`/${page}`}
                    className="hover:text-primary hover:underline transition duration-150"
                  >
                    {page.charAt(0).toUpperCase() + page.slice(1).replace('-', ' ')}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 📲 Social & Updates */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold mb-2">📢 Stay Connected</h4>
            <p className="text-sm text-base-content/70">
              {user
                ? 'Check your latest updates and competitions.'
                : 'Follow us for daily inspo & updates!'}
            </p>
            {user && (
              <Link
                href="/notifications"
                className="btn btn-outline btn-sm mt-3 rounded-full hover:scale-105"
              >
                View Updates
              </Link>
            )}
            {/* Social buttons using unique emojis */}
            <div className="flex gap-4 mt-3">
              {[
                {
                  name: 'Instagram',
                  link: 'https://instagram.com',
                  label: 'IG',
                  className:
                    'mask mask-circle w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center',
                },
                {
                  name: 'LinkedIn',
                  link: 'https://linkedin.com',
                  label: 'LN',
                  className:
                    'mask mask-squircle w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center',
                },
                // {
                //   name: 'TikTok',
                //   link: 'https://tiktok.com',
                //   label: 'TT',
                //   className:
                //     'mask mask-hexagon w-10 h-10 bg-black flex items-center justify-center',
                // },
                {
                  name: 'Twitter',
                  link: 'https://twitter.com',
                  label: 'X',
                  className:
                    'mask mask-star w-10 h-10 bg-gradient-to-br from-gray-700 to-black flex items-center justify-center',
                },
              ].map((s) => (
                <Link
                  key={s.name}
                  href={s.link}
                  className={`text-white ${s.className}`}
                  aria-label={s.name}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 📄 Footer Bottom */}
        <div className="mt-10 pt-4 text-center text-sm text-base-content/60 border-t border-base-300">
          &copy; {new Date().getFullYear()} <strong>{appData?.appName || 'YourCommunity'}</strong>.
          All rights reserved 💖
        </div>
      </footer>
    </>
  );
};

export default Footer;
