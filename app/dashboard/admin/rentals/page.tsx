"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import StatusBadge from "@/components/StatusBadge";
import { Skeleton, RowSkeleton } from "@/components/Skeleton";

type AdminOrder = {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  createdAt?: string;
  customer?: { id: string; name: string; email: string };
};

export default function AdminRentalsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [rentals, setRentals] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    api
      .get<AdminOrder[]>("/admin/rentals")
      .then((res) => setRentals(res.data || []))
      .catch((err) => toast(err.message, "error"))
      .finally(() => setLoading(false));
  }, [router, toast]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-8">
        <Skeleton className="mb-6 h-8 w-52" />
        <div className="overflow-hidden rounded border">
          {Array.from({ length: 5 }).map((_, i) => (
            <RowSkeleton key={i} columns={5} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rental Oversight</h1>
        <span className="text-sm text-gray-600">{rentals.length} orders</span>
      </div>

      {rentals.length === 0 ? (
        <p className="text-gray-600">No rental orders found.</p>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Period</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-2 font-mono text-xs">{r.id.slice(0, 8)}</td>
                  <td className="px-4 py-2">
                    <p className="font-medium">{r.customer?.name || "-"}</p>
                    <p className="text-xs text-gray-500">{r.customer?.email}</p>
                  </td>
                  <td className="px-4 py-2">
                    {r.startDate?.split("T")[0]} to {r.endDate?.split("T")[0]}
                  </td>
                  <td className="px-4 py-2">${r.totalAmount}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
