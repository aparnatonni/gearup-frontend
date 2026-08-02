'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import StatusBadge, { nextProviderAction } from '@/components/StatusBadge';
import { useToast } from '@/components/Toast';
import { Skeleton } from '@/components/Skeleton';

type Order = {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  customer?: { name: string };
  totalAmount?: number;
};

export default function ProviderOrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  function loadOrders() {
    api
      .get<Order[]>('/provider/orders')
      .then((res) => setOrders(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    loadOrders();
  }, [router]);

  async function handleUpdateStatus(orderId: string, newStatus: string) {
    setActionLoadingId(orderId);
    try {
      await api.patch('/provider/orders/' + orderId, { status: newStatus });
      loadOrders();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to update order', 'error');
    } finally {
      setActionLoadingId(null);
    }
  }

  function nextAction(order: Order) {
    return nextProviderAction(order);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <Skeleton className="mb-6 h-8 w-44" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="mb-3 h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Incoming Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const action = nextAction(order);

            return (
              <div key={order.id} className="border rounded p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {order.customer?.name || 'Customer'} — {order.startDate?.split('T')[0]} to{' '}
                    {order.endDate?.split('T')[0]}
                  </p>
                  <StatusBadge status={order.status} />
                </div>

                {action && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, action.status)}
                    disabled={actionLoadingId === order.id}
                    className="bg-black text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                  >
                    {actionLoadingId === order.id ? 'Updating...' : action.label}
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