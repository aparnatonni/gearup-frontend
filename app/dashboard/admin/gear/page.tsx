"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { gearCover } from "@/lib/images";
import { useToast } from "@/components/Toast";
import { Skeleton, RowSkeleton } from "@/components/Skeleton";

type AdminGear = {
  id: string;
  name: string;
  brand?: string;
  pricePerDay: number;
  quantity: number;
  available: boolean;
  images?: string[];
  category?: { id: string; name: string };
  provider?: { id: string; name: string };
  createdAt?: string;
};

export default function AdminGearPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [gear, setGear] = useState<AdminGear[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    api
      .get<AdminGear[]>("/admin/gear")
      .then((res) => setGear(res.data || []))
      .catch((err) => toast(err.message, "error"))
      .finally(() => setLoading(false));
  }, [router, toast]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-8">
        <Skeleton className="mb-6 h-8 w-52" />
        <div className="overflow-hidden rounded border">
          {Array.from({ length: 5 }).map((_, i) => (
            <RowSkeleton key={i} columns={7} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gear Moderation</h1>
        <span className="text-sm text-gray-600">{gear.length} listings</span>
      </div>

      {gear.length === 0 ? (
        <p className="text-gray-600">No gear listings found.</p>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Gear</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Provider</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Stock</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {gear.map((g) => (
                <tr key={g.id} className="border-t">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded">
                        <Image
                          src={gearCover(g.images, g.name, g.category?.name || "")}
                          alt={g.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{g.name}</p>
                        {g.brand && <p className="text-xs text-gray-500">{g.brand}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">{g.category?.name || "-"}</td>
                  <td className="px-4 py-2">{g.provider?.name || "-"}</td>
                  <td className="px-4 py-2">${g.pricePerDay}/day</td>
                  <td className="px-4 py-2">{g.quantity}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        g.available
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {g.available ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/gear/${g.id}`}
                      className="rounded border px-3 py-1 text-xs hover:bg-gray-50"
                    >
                      View
                    </Link>
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
