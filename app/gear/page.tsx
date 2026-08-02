'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link'; // Import Link
import { api } from '@/lib/api';

type Gear = {
  id: string;
  name: string;
  category: { id: string; name: string } | string;
  pricePerDay: number;
  available: boolean;
  imageUrl?: string;
};

export default function GearListPage() {
  const [gear, setGear] = useState<Gear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<Gear[]>('/gear')
      .then((res) => setGear(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8">Loading gear...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Browse Gear</h1>

      {gear.length === 0 ? (
        <p className="text-gray-600">No gear available right now.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {gear.map((item) => {
            const detailUrl = `/gear/${item.id}`;
            const categoryName =
              typeof item.category === 'string'
                ? item.category
                : item.category?.name || '';

            return (
              // Fixed: Added <Link> tag component here
              <Link
                key={item.id}
                href={detailUrl}
                className="border rounded overflow-hidden hover:shadow-md transition block"
              >
                <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    'No image'
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-semibold">{item.name}</h2>
                  <p className="text-sm text-gray-600">{categoryName}</p>
                  <p className="mt-2 font-medium">${item.pricePerDay}/day</p>
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
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}