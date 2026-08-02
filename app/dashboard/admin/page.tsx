"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { User } from "@/lib/types";
import { Skeleton } from "@/components/Skeleton";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

type GearItem = {
  id: string;
  name: string;
};

type Order = {
  id: string;
  status: string;
  totalAmount: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [gear, setGear] = useState<GearItem[]>([]);
  const [rentals, setRentals] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    api
      .get<User>("/auth/me")
      .then((res) => setUser(res.data || null))
      .catch(() => {});

    Promise.all([
      api.get<AdminUser[]>("/admin/users"),
      api.get<GearItem[]>("/admin/gear"),
      api.get<Order[]>("/admin/rentals"),
    ])
      .then(([usersRes, gearRes, rentalRes]) => {
        setUsers(usersRes.data || []);
        setGear(gearRes.data || []);
        setRentals(rentalRes.data || []);
      })
      .catch(() => {
        Cookies.remove("token");
        Cookies.remove("role");
        router.push("/auth/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  function handleLogout() {
    Cookies.remove("token");
    Cookies.remove("role");
    router.push("/auth/login");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-8">
        <Skeleton className="mb-8 h-8 w-56" />
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const activeRentals = rentals.filter((r) =>
    ["CONFIRMED", "PAID", "PICKED_UP"].includes(r.status)
  ).length;
  const totalRevenue = rentals
    .filter((r) => r.status === "RETURNED" || r.status === "PICKED_UP" || r.status === "PAID")
    .reduce((sum, r) => sum + (r.totalAmount || 0), 0);

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome, {user?.name || "Admin"}</h1>
        <button onClick={handleLogout} className="text-sm text-gray-600 underline">
          Log out
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded border p-4">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-gray-600">Gear Listings</p>
          <p className="text-2xl font-bold">{gear.length}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-gray-600">Active Rentals</p>
          <p className="text-2xl font-bold">{activeRentals}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-gray-600">Revenue</p>
          <p className="text-2xl font-bold">${totalRevenue}</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/admin/users"
          className="block rounded border p-6 hover:bg-gray-50"
        >
          <h2 className="font-semibold">User Management</h2>
          <p className="mt-1 text-sm text-gray-600">
            Search users and suspend or activate accounts.
          </p>
        </Link>
        <Link
          href="/dashboard/admin/gear"
          className="block rounded border p-6 hover:bg-gray-50"
        >
          <h2 className="font-semibold">Gear Moderation</h2>
          <p className="mt-1 text-sm text-gray-600">
            Review all gear listings across providers.
          </p>
        </Link>
        <Link
          href="/dashboard/admin/rentals"
          className="block rounded border p-6 hover:bg-gray-50"
        >
          <h2 className="font-semibold">Rental Oversight</h2>
          <p className="mt-1 text-sm text-gray-600">
            Monitor all rental orders platform-wide.
          </p>
        </Link>
      </div>
    </div>
  );
}
