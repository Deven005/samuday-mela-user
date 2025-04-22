// app/components/NotificationDropdown.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

export interface MyNotification {
  id: string;
  title: string;
  description: string;
  link: string;
  icon?: string;
  createdAt: string;
}

export default function NotificationDropdown({
  notifications,
  openDropdown = false, // ✅ Determines whether to open dropdown on SSR trigger
}: {
  notifications: MyNotification[];
  openDropdown?: boolean;
}) {
  return (
    <div
      className={`dropdown dropdown-end ${openDropdown ? "dropdown-open" : ""}`}
    >
      {/* 🔔 Notification Icon */}
      <div tabIndex={0} className="btn btn-ghost btn-circle relative">
        <span className="badge badge-primary badge-xs absolute top-0 right-0">
          {notifications.length}
        </span>
        🔔
      </div>

      {/* Notification List */}
      <ul className="menu dropdown-content bg-base-100 rounded-md shadow-md mt-2 w-64">
        {notifications.length === 0 ? (
          <li className="text-gray-500 p-2 text-center">No notifications</li>
        ) : (
          notifications.map((notif) => (
            <li
              key={notif.id}
              className="p-3 flex items-start gap-3 hover:bg-base-200 transition"
            >
              {/* ✅ Show notification icon/image if available */}
              {notif.icon && (
                <Image
                  src={notif.icon}
                  alt="Icon"
                  width={30}
                  height={30}
                  className="rounded-md"
                />
              )}

              <div>
                <h3 className="font-semibold text-sm">{notif.title}</h3>
                <p className="text-gray-500 text-xs">{notif.description}</p>
                <p className="text-gray-400 text-xs">{notif.createdAt}</p>
              </div>
              <Link
                href={notif.link}
                className="text-blue-500 text-xs ml-auto hover:underline"
              >
                View
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
