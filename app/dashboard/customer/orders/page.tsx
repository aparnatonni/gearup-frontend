'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

type Order = {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  totalAmount?: number;
};

const STATUS_STYLES: Record<string, string> = {
  PLACED: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PAID: 'bg-purple-100 text-purple-700',
  PICKED_UP: 'bg-green-100 text-green-700',
  RETURNED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    api
      .get<Order[]>('/rentals')
      .then((res) => setOrders(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  async function handlePayNow(orderId: string) {
    setPayingId(orderId);
    try {
      const res = await api.post<{ checkoutUrl: string }>('/payments/create', {
        rentalOrderId: orderId,
      });
      if (res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to start payment');
      setPayingId(null);
    }
  }

  if (loading) {
    return <div className="p-8">Loading orders...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const badgeClass = STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600';
            return (
              <div key={order.id} className="border rounded p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {order.startDate?.split('T')[0]} to {order.endDate?.split('T')[0]}
                  </p>
                  <span className={'text-xs px-2 py-1 rounded inline-block mt-1 ' + badgeClass}>
                    {order.status}
                  </span>
                </div>

                {order.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handlePayNow(order.id)}
                    disabled={payingId === order.id}
                    className="bg-black text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                  >
                    {payingId === order.id ? 'Redirecting...' : 'Pay Now'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}