import Link from "next/link";
import Image from "next/image";
import { getAppData } from "./utils/utils";

export default async function NotFound() {
  const appData = await getAppData();

  return (
    <div className="min-h-screen px-4 py-12 bg-base-100 flex flex-col items-center justify-center text-center">
      {/* Grid Header: Logo + Name + Tagline */}
      <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] items-center gap-4 mb-10 max-w-3xl w-full text-left">
        {appData?.logoUrl && (
          <div className="flex justify-center md:justify-start">
            <Image
              src={appData.logoUrl}
              alt="App Logo"
              width={70}
              height={70}
              className="rounded-md"
            />
          </div>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            {appData?.appName ?? "Our Community"}
          </h1>
          {appData?.tagline && (
            <p className="text-sm text-gray-500 mt-1">{appData.tagline}</p>
          )}
          <p className="text-gray-600 text-sm mt-2">
            A vibrant space to connect, share, learn, and grow together as a
            community.
          </p>
        </div>
      </div>

      {/* 404 Message */}
      <h2 className="text-4xl font-extrabold text-error mb-4">
        404 - Page Not Found
      </h2>
      <p className="text-base text-gray-600 max-w-md mb-8">
        Looks like you took a wrong turn. But don’t worry, there’s plenty to
        explore!
      </p>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-5xl w-full mb-10 px-2">
        {[
          {
            title: "🤝 Networking",
            desc: "Connect with like-minded individuals and build lasting relationships.",
          },
          {
            title: "📝 Posting & Feeds",
            desc: "Express yourself and stay updated through community feeds.",
          },
          {
            title: "📚 Learn & Grow",
            desc: "Access shared knowledge, tutorials, and discussions.",
          },
          {
            title: "🎯 Competitions",
            desc: "Take part in fun and skill-based challenges to win rewards.",
          },
          {
            title: "🎉 Community Events",
            desc: "Join live events, webinars, and local meetups.",
          },
          {
            title: "🛒 E-commerce (Coming Soon)",
            desc: "A marketplace to buy, sell, and support your community.",
          },
        ].map((feature, idx) => (
          <div
            key={idx}
            className="p-5 rounded-lg border border-base-200 bg-base-200 hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="flex gap-4 flex-wrap justify-center">
        <Link href="/" className="btn btn-primary">
          🏠 Go Back Home
        </Link>
        <Link href="/posts" className="btn btn-outline">
          🚀 Explore Posts
        </Link>
      </div>
    </div>
  );
}
