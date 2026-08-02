"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { Skeleton } from "@/components/Skeleton";

type Order = {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
};

export default function CustomerPayPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    api
      .get<Order>(`/rentals/${orderId}`)
      .then((res) => setOrder(res.data || null))
      .catch((err) => toast(err.message, "error"))
      .finally(() => setLoading(false));
  }, [orderId, router, toast]);

  async function handlePay() {
    setPaying(true);
    try {
      const res = await api.post<{ checkoutUrl: string }>("/payments/create", {
        rentalOrderId: orderId,
      });
      if (res.data?.checkoutUrl) {
        window.location.assign(res.data.checkoutUrl);
      }
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to start payment", "error");
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg p-8">
        <Skeleton className="mb-6 h-8 w-52" />
        <Skeleton className="h-52 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-lg p-8">
        <p className="text-gray-600">Order not found.</p>
        <Link href="/dashboard/customer/orders" className="mt-4 inline-block underline">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg p-8">
      <h1 className="mb-6 text-2xl font-bold">Complete Payment</h1>

      <div className="rounded border p-5">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Order ID</span>
          <span className="font-mono">{order.id.slice(0, 8)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-gray-600">Rental Period</span>
          <span>
            {order.startDate?.split("T")[0]} to {order.endDate?.split("T")[0]}
          </span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-gray-600">Status</span>
          <span className="font-medium">{order.status}</span>
        </div>
        <div className="mt-4 flex justify-between border-t pt-4">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-bold">${order.totalAmount}</span>
        </div>

        {order.status === "CONFIRMED" ? (
          <button
            onClick={handlePay}
            disabled={paying}
            className="mt-6 w-full rounded bg-black px-4 py-3 text-white disabled:opacity-50"
          >
            {paying ? "Redirecting to checkout..." : "Proceed to Pay"}
          </button>
        ) : (
          <p className="mt-6 text-center text-sm text-gray-600">
            This order is not ready for payment (status: {order.status}).
          </p>
        )}
      </div>

      <Link href="/dashboard/customer/orders" className="mt-4 inline-block text-sm underline">
        Back to orders
      </Link>
    </div>
  );
}
