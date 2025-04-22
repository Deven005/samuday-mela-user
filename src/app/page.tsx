import Link from "next/link";
import { clearUserData, getAppData, getUserData } from "./utils/utils";
import { DocumentData } from "firebase-admin/firestore";
import { cookies } from "next/headers";

export default async function Home() {
  const appData = await getAppData();
  let user: DocumentData | null | undefined = null;

  try {
    user = await getUserData();
    const sessionCookie = (await cookies()).get("session")?.value;

    const res = await (
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionCookie }),
      })
    ).json();

    if (!res.valid) {
      user = undefined;
      clearUserData();
    }
  } catch (error: any) {
    console.log("Home:", error ?? "Something is wrong!");
  }

  return (
    <div className="bg-base-100 min-h-screen flex flex-col justify-center items-center px-6 md:px-12 py-16">
      {!user ? (
        <div className="max-w-7xl mx-auto space-y-20 text-center">
          {/* ✨ Hero Section */}
          <section className="space-y-6">
            <h1 className="text-6xl font-bold text-neutral leading-snug">
              Join the Movement. <br /> Connect & Compete!
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {appData?.appName} is the perfect space to **network, engage in
              discussions**, and **join competitions** that fuel creativity and
              innovation.
            </p>
            <div className="flex justify-center gap-6">
              <Link href="/sign-in">
                <button className="btn btn-primary btn-lg rounded-md shadow-md hover:shadow-xl transition-all">
                  Sign In
                </button>
              </Link>
              <Link href="/explore">
                <button className="btn btn-outline btn-lg rounded-md hover:bg-primary hover:text-white transition-all">
                  Explore Communities
                </button>
              </Link>
            </div>
          </section>

          {/* 🚀 Community Features Section */}
          <section className="grid md:grid-cols-4 gap-8">
            <FeatureCard
              title="Social Hub"
              description="Connect with members, share thoughts, and post updates."
              icon="📢"
            />
            <FeatureCard
              title="Live Chat"
              description="Instantly communicate with friends and community members."
              icon="💬"
            />
            <FeatureCard
              title="Competitions"
              description="Participate in challenges, showcase your skills, and win prizes."
              icon="🏆"
            />
            <FeatureCard
              title="Networking"
              description="Find like-minded individuals and build powerful connections."
              icon="🤝"
            />
          </section>

          {/* 📢 CTA */}
          <section className="text-center">
            <p className="text-gray-500 text-lg">
              Your next big opportunity starts here. Become part of a thriving
              network today!
            </p>
            <Link href="/sign-up">
              <button className="btn btn-accent btn-lg rounded-md shadow-md hover:shadow-xl transition-all mt-6">
                Join Now
              </button>
            </Link>
          </section>
        </div>
      ) : (
        // 🔵 Signed-In User View
        <div className="max-w-7xl mx-auto space-y-16">
          {/* 👋 Welcome Section */}
          <section className="space-y-4 text-center">
            <h2 className="text-5xl font-semibold text-neutral">
              Welcome back,{" "}
              <span className="text-primary font-bold">
                {user.displayName || "Friend"}
              </span>
              !
            </h2>
            <p className="text-lg text-gray-600">
              Explore new opportunities within the community today.
            </p>
          </section>

          {/* 📌 Community Dashboard */}
          <section className="grid md:grid-cols-4 gap-8">
            <DashboardCard
              title="My Posts"
              description="Manage your updates and conversations."
              href="/profile"
              buttonLabel="View My Posts"
            />
            <DashboardCard
              title="Live Chat"
              description="Join real-time discussions with your peers."
              href="/chat"
              buttonLabel="Join Chat"
            />
            <DashboardCard
              title="Competitions"
              description="Find ongoing challenges and compete for rewards."
              href="/competitions"
              buttonLabel="View Competitions"
            />
            <DashboardCard
              title="Networking Hub"
              description="Connect with professionals and grow your network."
              href="/networking"
              buttonLabel="Expand Connections"
            />
          </section>

          {/* 🌟 Community Spotlight */}
          <section className="bg-base-200 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all">
            <h3 className="text-xl font-semibold mb-3">
              🌟 Community Spotlight
            </h3>
            <p className="text-gray-600">
              Check out top contributors, trending discussions, and exclusive
              events.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

const FeatureCard = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) => (
  <div className="card bg-base-200 shadow-lg hover:shadow-2xl transition-all p-6 text-center">
    <div className="text-5xl">{icon}</div>
    <h3 className="text-2xl font-bold mt-3">{title}</h3>
    <p className="text-gray-600 text-lg mt-2">{description}</p>
  </div>
);

const DashboardCard = ({
  title,
  description,
  href,
  buttonLabel,
}: {
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
}) => (
  <div className="card bg-base-200 shadow-lg p-6 rounded-lg hover:shadow-2xl transition-all">
    <h3 className="text-xl font-bold">{title}</h3>
    <p className="text-gray-600 mt-2">{description}</p>
    <Link href={href}>
      <button className="btn btn-primary btn-sm rounded-md shadow-md hover:shadow-lg mt-4">
        {buttonLabel}
      </button>
    </Link>
  </div>
);
