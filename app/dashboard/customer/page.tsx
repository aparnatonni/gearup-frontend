"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { User } from "@/lib/types";
import { Skeleton } from "@/components/Skeleton";

type Order = {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
};

type Payment = { id: string; amount: number; status: string };

const ACTIVE_STATUSES = ["PLACED", "CONFIRMED", "PAID", "PICKED_UP"];

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
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
      api.get<Order[]>("/rentals"),
      api.get<Payment[]>("/payments"),
    ])
      .then(([orderRes, payRes]) => {
        setOrders(orderRes.data || []);
        setPayments(payRes.data || []);
      })
      .catch(() => {
        Cookies.remove("token");
        Cookies.remove("role");
        router.push("/auth/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-8">
        <Skeleton className="h-8 w-56" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length;
  const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome, {user?.name || "Customer"}</h1>
        <button
          onClick={() => {
            Cookies.remove("token");
            Cookies.remove("role");
            router.push("/auth/login");
          }}
          className="text-sm text-gray-600 underline"
        >
          Log out
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-5">
          <p className="text-sm text-gray-600">Active Rentals</p>
          <p className="mt-1 text-3xl font-bold">{activeOrders}</p>
        </div>
        <div className="rounded-lg border p-5">
          <p className="text-sm text-gray-600">Total Orders</p>
          <p className="mt-1 text-3xl font-bold">{orders.length}</p>
        </div>
        <div className="rounded-lg border p-5">
          <p className="text-sm text-gray-600">Total Spent</p>
          <p className="mt-1 text-3xl font-bold">${totalSpent}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/customer/orders"
          className="block rounded-lg border p-6 hover:bg-gray-50"
        >
          <h2 className="font-semibold">My Orders</h2>
          <p className="mt-1 text-sm text-gray-600">
            Track rentals, pay for confirmed orders, and leave reviews.
          </p>
        </Link>
        <Link
          href="/dashboard/customer/payments"
          className="block rounded-lg border p-6 hover:bg-gray-50"
        >
          <h2 className="font-semibold">Payment History</h2>
          <p className="mt-1 text-sm text-gray-600">
            View all your completed and pending transactions.
          </p>
        </Link>
      </div>
    </div>
  );
}
