// app/components/Header.tsx
import Image from "next/image";
import { headers } from "next/headers";
import Link from "next/link";
import LogoutButton from "./Button/LogoutButton";
import { DocumentData } from "firebase-admin/firestore";
import { Button } from "./Button/Button";
import { getNotifications, getUserData } from "../utils/utils";
import NotificationDropdown from "./Notification/NotificationDropdown";

interface HeaderProps {
  appData: DocumentData | undefined;
  user: DocumentData | null | undefined;
}

export default async function Header({ appData, user }: HeaderProps) {
  const headerData = await headers();
  const pathname = headerData.get("next-url") || "/";

  const isActive = (route: string) =>
    pathname === route ? "bg-base-200 font-semibold" : "hover:bg-base-100";

  const notifications = await getNotifications(); // ✅ Fetch notifications on the server

  return (
    <header className="bg-base-100 shadow-md sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Left: App Data - Logo & Branding */}
        <Link
          href="/"
          className="flex items-center gap-3 hover:scale-105 transition"
        >
          {appData?.logoUrl && (
            <Image
              src={appData.logoUrl}
              alt="Logo"
              width={50}
              height={50}
              className="rounded-md object-contain"
            />
          )}
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-bold">
              {appData?.appName}
            </span>
            <span className="text-xs text-gray-500">{appData?.tagline}</span>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="flex gap-5">
          {user && (
            <>
              <Link
                href="/posts"
                className={`btn btn-ghost ${isActive("/posts")}`}
              >
                Posts
              </Link>
              <Link
                href="/profile"
                className={`btn btn-ghost ${isActive("/profile")}`}
              >
                Profile
              </Link>
            </>
          )}
        </nav>

        {/* Right: User Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* 🔔 Notification Dropdown (Open via Query Params) */}
              <NotificationDropdown notifications={notifications} />

              {/* Avatar & User Dropdown */}
              <div className="dropdown dropdown-end">
                <div tabIndex={0} className="btn btn-ghost btn-circle avatar">
                  <Image
                    src={
                      user.photoURL ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.displayName || "User"
                      )}`
                    }
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                </div>
                <ul className="menu dropdown-content bg-base-100 rounded-md shadow-md mt-2 w-48">
                  <li>
                    <Link href="/profile">Profile</Link>
                  </li>
                  <li>
                    <LogoutButton />
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <Link href="/sign-in">
              <Button className="btn btn-primary">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
