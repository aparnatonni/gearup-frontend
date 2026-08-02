"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { Skeleton, RowSkeleton } from "@/components/Skeleton";

type Payment = {
  id: string;
  transactionId: string;
  amount: number;
  method: string;
  status: string;
  paidAt?: string;
  createdAt?: string;
  rentalOrder?: { id: string; status: string };
};

export default function CustomerPaymentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    api
      .get<Payment[]>("/payments")
      .then((res) => setPayments(res.data || []))
      .catch((err) => toast(err.message, "error"))
      .finally(() => setLoading(false));
  }, [router, toast]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <Skeleton className="mb-6 h-8 w-44" />
        <div className="overflow-hidden rounded border">
          {Array.from({ length: 4 }).map((_, i) => (
            <RowSkeleton key={i} columns={5} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Payment History</h1>

      {payments.length === 0 ? (
        <p className="text-gray-600">No payments yet.</p>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Transaction</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Method</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-2">
                    {p.paidAt?.split("T")[0] || p.createdAt?.split("T")[0] || "-"}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{p.transactionId}</td>
                  <td className="px-4 py-2">${p.amount}</td>
                  <td className="px-4 py-2">{p.method}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        p.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {p.status}
                    </span>
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
