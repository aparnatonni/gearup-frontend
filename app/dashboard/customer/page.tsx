'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { User } from '@/lib/types';

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    api
      .get<User>('/auth/me')
      .then((res) => setUser(res.data!))
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="/gear" className="border rounded p-6 hover:bg-gray-50">
          <h2 className="font-semibold mb-1">Browse Gear</h2>
          <p className="text-sm text-gray-600">Find equipment to rent</p>
        </a>
        <div className="border rounded p-6">
          <h2 className="font-semibold mb-1">My Orders</h2>
          <p className="text-sm text-gray-600">Coming next</p>
        </div>
      </div>
    </div>
  );
}