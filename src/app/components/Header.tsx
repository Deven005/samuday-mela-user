import Image from 'next/image';
import { headers } from 'next/headers';
import Link from 'next/link';
import LogoutButton from './Button/LogoutButton';
import { DocumentData } from 'firebase-admin/firestore';
import { Button } from './Button/Button';
import { getNotifications, getUserData } from '../utils/utils';
import NotificationDropdown from './Notification/NotificationDropdown';
import { ThemeSwitcher } from './Theme/ThemeSwitcher';

interface HeaderProps {
  appData: DocumentData | undefined;
}

export default async function Header({ appData }: HeaderProps) {
  const headerData = await headers();
  const pathname = headerData.get('next-url') || '/';
  const user = await getUserData();

  const isActive = (route: string) =>
    pathname === route ? 'bg-base-200 font-semibold' : 'hover:bg-base-100';

  const notifications = await getNotifications();

  // const closeDrawer = () => {
  //   (document.getElementById("mobile-drawer")as HTMLInputElement)!.checked = false;
  // };

  return (
    <header className="bg-base-100 text-base-content shadow sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Left: Logo + Branding */}
        <Link href="/" className="flex items-center gap-3 hover:scale-105 transition">
          {appData?.logoUrl && (
            <Image
              src={appData.logoUrl}
              alt="Logo"
              width={40}
              height={40}
              className="rounded-md object-contain"
            />
          )}
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-bold">{appData?.appName}</span>
            <span className="text-xs text-base-content/70">{appData?.tagline}</span>
          </div>
        </Link>

        {/* Center: Navigation (hidden on mobile) */}
        <nav className="hidden md:flex gap-4">
          <Link href="/communities" className={`btn btn-ghost btn-sm ${isActive('/communities')}`}>
            Communities
          </Link>
          {user && (
            <>
              <Link href="/posts" className={`btn btn-ghost btn-sm ${isActive('/posts')}`}>
                Posts
              </Link>
              <Link href="/profile" className={`btn btn-ghost btn-sm ${isActive('/profile')}`}>
                Profile
              </Link>
            </>
          )}
        </nav>

        {/* Right: Actions + Hamburger */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          {user && <NotificationDropdown notifications={notifications} />}

          {user ? (
            <div className="dropdown dropdown-end hidden lg:flex">
              <div tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <Image
                  src={
                    user?.photoURL ??
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}`
                  }
                  alt="Profile"
                  width={36}
                  height={36}
                  className="rounded-full object-cover"
                />
              </div>
              <ul className="menu dropdown-content bg-base-100 text-base-content rounded-md shadow w-48 mt-2">
                <li>
                  <Link href="/profile">Profile</Link>
                </li>
                <li>
                  <LogoutButton />
                </li>
              </ul>
            </div>
          ) : (
            <Link href="/sign-in">
              <Button className="btn btn-primary btn-sm">Sign In</Button>
            </Link>
          )}

          {/* Mobile Hamburger */}
          <label htmlFor="mobile-drawer" className="btn btn-ghost md:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>
        </div>
      </div>

      {/* Mobile Drawer */}
      <input id="mobile-drawer" type="checkbox" className="drawer-toggle hidden" />
      <div className="drawer-side z-50">
        <label htmlFor="mobile-drawer" className="drawer-overlay"></label>
        <ul className="menu p-4 w-64 bg-base-200 text-base-content h-full">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/communities" className={isActive('/communities')}>
              Communities
            </Link>
          </li>
          {user && (
            <>
              <li>
                <Link href="/posts" className={isActive('/posts')}>
                  Posts
                </Link>
              </li>
              <li>
                <Link href="/profile" className={isActive('/profile')}>
                  Profile
                </Link>
              </li>
            </>
          )}
          <li className="mt-2">
            <ThemeSwitcher />
          </li>
          <li>
            {user ? (
              <LogoutButton />
            ) : (
              <Link href="/sign-in">
                <Button className="btn btn-primary w-full">Sign In</Button>
              </Link>
            )}
          </li>
        </ul>
      </div>

      {/* <div id="controls-carousel" className="relative w-full" data-carousel="static">
        <div className="relative h-56 overflow-hidden rounded-lg md:h-96">
          <div className="hidden duration-700 ease-in-out" data-carousel-item>
            <img
              src="/docs/images/carousel/carousel-1.svg"
              className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
              alt="..."
            />
          </div>
          <div className="hidden duration-700 ease-in-out" data-carousel-item="active">
            <img
              src="/docs/images/carousel/carousel-2.svg"
              className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
              alt="..."
            />
          </div>
          <div className="hidden duration-700 ease-in-out" data-carousel-item>
            <img
              src="/docs/images/carousel/carousel-3.svg"
              className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
              alt="..."
            />
          </div>
          <div className="hidden duration-700 ease-in-out" data-carousel-item>
            <img
              src="/docs/images/carousel/carousel-4.svg"
              className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
              alt="..."
            />
          </div>
          <div className="hidden duration-700 ease-in-out" data-carousel-item>
            <img
              src="/docs/images/carousel/carousel-5.svg"
              className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
              alt="..."
            />
          </div>
        </div>
        <button
          type="button"
          className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
          data-carousel-prev
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
            <svg
              className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 1 1 5l4 4"
              />
            </svg>
            <span className="sr-only">Previous</span>
          </span>
        </button>
        <button
          type="button"
          className="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
          data-carousel-next
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
            <svg
              className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m1 9 4-4-4-4"
              />
            </svg>
            <span className="sr-only">Next</span>
          </span>
        </button>
      </div> */}
    </header>
  );
}
