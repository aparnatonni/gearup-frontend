'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { User } from '@/lib/types';

type GearItem = {
  id: string;
  name: string;
  pricePerDay: number;
  available: boolean;
};

export default function ProviderDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [gear, setGear] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    Promise.all([
      api.get<User>('/auth/me'),
      api.get<GearItem[]>('/provider/gear'),
    ])
      .then(([userRes, gearRes]) => {
        setUser(userRes.data || null);
        setGear(gearRes.data || []);
      })
      .catch(() => {
        Cookies.remove('token');
        Cookies.remove('role');
        router.push('/auth/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  function handleLogout() {
    Cookies.remove('token');
    Cookies.remove('role');
    router.push('/auth/login');
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
        <button onClick={handleLogout} className="text-sm underline text-gray-600">
          Log out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border rounded p-4">
          <p className="text-sm text-gray-600">Total Gear</p>
          <p className="text-2xl font-bold">{gear.length}</p>
        </div>
        <a href="/dashboard/provider/gear/new" className="border rounded p-4 hover:bg-gray-50 block">
          <p className="text-sm text-gray-600">Add new gear</p>
          <p className="text-lg font-semibold">+ Add Gear</p>
        </a>
        <a href="/dashboard/provider/orders" className="border rounded p-4 hover:bg-gray-50 block">
          <p className="text-sm text-gray-600">Manage orders</p>
          <p className="text-lg font-semibold">View Orders</p>
        </a>
      </div>

      <h2 className="text-lg font-semibold mb-3">Your Gear</h2>
      {gear.length === 0 ? (
        <p className="text-gray-600">No gear listed yet.</p>
      ) : (
        <div className="space-y-2">
          {gear.map((item) => (
            <div key={item.id} className="border rounded p-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">${item.pricePerDay}/day</p>
              </div>
              <span
                className={
                  item.available
                    ? 'text-xs px-2 py-1 rounded bg-green-100 text-green-700'
                    : 'text-xs px-2 py-1 rounded bg-gray-100 text-gray-500'
                }
              >
                {item.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}