"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import { useToast } from "@/components/Toast";
import { Skeleton } from "@/components/Skeleton";

type GearItem = {
  id: string;
  name: string;
  quantity: number;
  priceAtRental: number;
  gearItem?: { id: string; name: string };
};

type Order = {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  items?: GearItem[];
};

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Record<string, { rating: number; comment: string }>>({});

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    api
      .get<Order[]>("/rentals")
      .then((res) => setOrders(res.data || []))
      .catch((err) => toast(err.message, "error"))
      .finally(() => setLoading(false));
  }, [router, toast]);

  async function handlePayNow(orderId: string) {
    setPayingId(orderId);
    try {
      const res = await api.post<{ checkoutUrl: string }>("/payments/create", {
        rentalOrderId: orderId,
      });
      if (res.data?.checkoutUrl) {
        window.location.assign(res.data.checkoutUrl);
      }
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to start payment", "error");
      setPayingId(null);
    }
  }

  async function handleSubmitReview(orderId: string, gearItemId: string) {
    const review = reviews[orderId];
    if (!review || !review.rating) {
      toast("Please select a rating", "error");
      return;
    }
    setReviewingId(orderId);
    try {
      await api.post("/reviews", {
        gearItemId,
        rating: review.rating,
        comment: review.comment,
      });
      toast("Review submitted", "success");
      setReviews((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to submit review", "error");
    } finally {
      setReviewingId(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <Skeleton className="mb-6 h-8 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-bold">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">
                    {order.startDate?.split("T")[0]} to {order.endDate?.split("T")[0]}
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={order.status} />
                  </div>
                  {order.items && order.items.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-600">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.gearItem?.name || "Gear"} x{item.quantity} — $
                          {item.priceAtRental}/day
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  {order.totalAmount != null && (
                    <p className="text-sm font-medium">${order.totalAmount}</p>
                  )}

                  {order.status === "CONFIRMED" && (
                    <button
                      onClick={() => handlePayNow(order.id)}
                      disabled={payingId === order.id}
                      className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                      {payingId === order.id ? "Redirecting..." : "Pay Now"}
                    </button>
                  )}

                  {order.status === "RETURNED" && order.items && order.items.length > 0 && (
                    <div className="mt-2 w-56 rounded border p-3">
                      <p className="mb-2 text-xs font-semibold text-gray-700">Leave a review</p>
                      <select
                        value={reviews[order.id]?.rating ?? ""}
                        onChange={(e) =>
                          setReviews((prev) => ({
                            ...prev,
                            [order.id]: { rating: Number(e.target.value), comment: prev[order.id]?.comment || "" },
                          }))
                        }
                        className="w-full rounded border px-2 py-1 text-sm"
                      >
                        <option value="">Rating...</option>
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {"★".repeat(n)}
                          </option>
                        ))}
                      </select>
                      <textarea
                        value={reviews[order.id]?.comment || ""}
                        onChange={(e) =>
                          setReviews((prev) => ({
                            ...prev,
                            [order.id]: { rating: prev[order.id]?.rating || 0, comment: e.target.value },
                          }))
                        }
                        placeholder="Comment (optional)"
                        rows={2}
                        className="mt-2 w-full rounded border px-2 py-1 text-sm"
                      />
                      <button
                        onClick={() => handleSubmitReview(order.id, order.items![0].gearItem?.id || order.items![0].id)}
                        disabled={reviewingId === order.id}
                        className="mt-2 w-full rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                      >
                        {reviewingId === order.id ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
