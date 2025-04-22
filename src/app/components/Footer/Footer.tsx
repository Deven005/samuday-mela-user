// app/components/Footer.tsx
import Link from "next/link";
import { DocumentData } from "firebase-admin/firestore";
import FooterClient from "./FooterClient";

interface FooterPropType {
  appData: DocumentData | undefined;
  user: DocumentData | null | undefined;
}

const Footer = ({ appData, user }: FooterPropType) => {
  return (
    <>
      <FooterClient userId={user?.uid} />
      <footer className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-10 mt-auto shadow-lg">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* 🔥 Community Overview */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold tracking-wide">
              {user
                ? `👋 Hey, ${user?.displayName}!`
                : `🚀 Welcome to ${appData?.appName}`}
            </h3>
            <p className="mt-2 text-sm text-gray-200">
              {appData?.description ||
                "Join the movement to connect, compete, and grow in exciting challenges."}
            </p>
            {user ? (
              <Link
                href="/dashboard"
                className="btn btn-glass mt-4 px-6 py-2 text-sm rounded-full"
              >
                Go to Dashboard 🚀
              </Link>
            ) : (
              <Link
                href="/join"
                className="btn btn-glass mt-4 px-6 py-2 text-sm rounded-full"
              >
                Join Now 🚀
              </Link>
            )}
          </div>

          {/* 📢 Quick Links */}
          <div className="flex flex-col items-center md:items-start space-y-3">
            <h3 className="text-lg font-semibold">🌍 Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-white">
                  Competitions
                </Link>
              </li>
              <li>
                <Link href="/networking" className="hover:text-white">
                  Networking Hub
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-white">
                  Learning Resources
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* 🎉 Social Media & Updates */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold">📢 Stay Connected</h3>
            {user ? (
              <>
                <p className="text-sm text-gray-200">
                  Check out your latest updates & competitions.
                </p>
                <Link
                  href="/notifications"
                  className="btn btn-outline btn-sm mt-3"
                >
                  View Updates
                </Link>
              </>
            ) : (
              <p className="text-sm text-gray-200">
                Follow us for daily inspiration & updates!
              </p>
            )}

            {/* Social Media Icons */}
            <div className="flex gap-4 mt-3">
              <Link
                href="https://instagram.com"
                className="btn btn-sm btn-circle btn-glass"
              >
                IG
              </Link>
              <Link
                href="https://linkedin.com"
                className="btn btn-sm btn-circle btn-glass"
              >
                LN
              </Link>
              <Link
                href="https://tiktok.com"
                className="btn btn-sm btn-circle btn-glass"
              >
                TT
              </Link>
              <Link
                href="https://twitter.com"
                className="btn btn-sm btn-circle btn-glass"
              >
                X
              </Link>
            </div>
          </div>
        </div>

        {/* ⚡ Footer Bottom */}
        <div className="border-t border-gray-500 mt-6 pt-4 text-center text-sm text-gray-300">
          &copy; {new Date().getFullYear()}{" "}
          <strong>{appData?.appName || "YourCommunity"}</strong>. All rights
          reserved.
        </div>
      </footer>
    </>
  );
};

export default Footer;
