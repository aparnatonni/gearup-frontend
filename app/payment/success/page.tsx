'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

type Order = {
  id: string;
  status: string;
};

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('rentalId');

  const [order, setOrder] = useState<Order | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    api
      .get<Order>('/rentals/' + orderId)
      .then((res) => setOrder(res.data || null))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [orderId]);

  return (
    <div className="max-w-md mx-auto mt-24 p-6 text-center">
      <div className="text-5xl mb-4">✅</div>
      <h1 className="text-2xl font-bold mb-2">Payment Successful</h1>
      <p className="text-gray-600 mb-6">
        Thank you! Your rental payment has been processed.
      </p>

      {checking && orderId ? (
        <p className="text-sm text-gray-500">Checking order status...</p>
      ) : order ? (
        <p className="text-sm">
          Order status: <span className="font-semibold">{order.status}</span>
        </p>
      ) : null}

      <Link href="/dashboard/customer/orders" className="mt-6 inline-block text-sm underline">
        View my orders
      </Link>
    </div>
  );
}