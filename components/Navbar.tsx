"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";

export default function Navbar() {
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setRole(Cookies.get("role") || null);
    setMounted(true);
  }, []);

  const dashboardPath =
    role === "PROVIDER"
      ? "/dashboard/provider"
      : role === "ADMIN"
        ? "/dashboard/admin"
        : "/dashboard/customer";

  function handleLogout() {
    Cookies.remove("token");
    Cookies.remove("role");
    window.location.href = "/";
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold">
          GearUp
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/gear" className="hover:underline">
            Browse Gear
          </Link>
          {mounted && role ? (
            <>
              <Link href={dashboardPath} className="hover:underline">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-gray-600 underline">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hover:underline">
                Log in
              </Link>
              <Link
                href="/auth/register"
                className="rounded bg-black px-3 py-1.5 text-white"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
