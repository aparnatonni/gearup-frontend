"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { gearCover } from "@/lib/images";
import { User } from "@/lib/types";
import { Skeleton } from "@/components/Skeleton";

type GearItem = {
  id: string;
  name: string;
  pricePerDay: number;
  quantity: number;
  available: boolean;
  images?: string[];
};

type Order = {
  id: string;
  status: string;
};

export default function ProviderDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [gear, setGear] = useState<GearItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
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
      api.get<GearItem[]>("/provider/gear"),
      api.get<Order[]>("/provider/orders"),
    ])
      .then(([gearRes, orderRes]) => {
        setGear(gearRes.data || []);
        setOrders(orderRes.data || []);
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
      <div className="mx-auto max-w-4xl p-8">
        <Skeleton className="mb-8 h-8 w-56" />
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="mb-3 h-6 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="mb-2 h-16 w-full" />
        ))}
      </div>
    );
  }

  const activeRentals = orders.filter((o) =>
    ["CONFIRMED", "PAID", "PICKED_UP"].includes(o.status)
  ).length;
  const pendingOrders = orders.filter((o) => o.status === "PLACED").length;

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome, {user?.name || "Provider"}</h1>
        <button onClick={handleLogout} className="text-sm text-gray-600 underline">
          Log out
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded border p-4">
          <p className="text-sm text-gray-600">Total Gear</p>
          <p className="text-2xl font-bold">{gear.length}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-gray-600">Active Rentals</p>
          <p className="text-2xl font-bold">{activeRentals}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-gray-600">Pending Orders</p>
          <p className="text-2xl font-bold">{pendingOrders}</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          href="/dashboard/provider/gear/new"
          className="block rounded border p-4 hover:bg-gray-50"
        >
          <p className="text-sm text-gray-600">Add new gear</p>
          <p className="text-lg font-semibold">+ Add Gear</p>
        </Link>
        <Link
          href="/dashboard/provider/orders"
          className="block rounded border p-4 hover:bg-gray-50"
        >
          <p className="text-sm text-gray-600">Manage orders</p>
          <p className="text-lg font-semibold">View Orders</p>
        </Link>
      </div>

      <h2 className="mb-3 text-lg font-semibold">Your Gear</h2>
      {gear.length === 0 ? (
        <p className="text-gray-600">No gear listed yet.</p>
      ) : (
        <div className="space-y-2">
          {gear.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded">
                  <Image
                    src={gearCover(item.images, item.name)}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    ${item.pricePerDay}/day · {item.quantity} in stock
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={
                    item.available
                      ? "rounded bg-green-100 px-2 py-1 text-xs text-green-700"
                      : "rounded bg-gray-100 px-2 py-1 text-xs text-gray-500"
                  }
                >
                  {item.available ? "Available" : "Unavailable"}
                </span>
                <Link
                  href={`/dashboard/provider/gear/${item.id}/edit`}
                  className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
