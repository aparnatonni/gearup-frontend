'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';

type Gear = {
  id: string;
  name: string;
  category: { id: string; name: string } | string;
  description?: string;
  pricePerDay: number;
  available: boolean;
  imageUrl?: string;
  provider?: { id: string; name: string };
};

export default function GearDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [gear, setGear] = useState<Gear | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [renting, setRenting] = useState(false);
  const [rentError, setRentError] = useState('');
  const [rentSuccess, setRentSuccess] = useState(false);

  useEffect(() => {
    api
      .get<Gear>('/gear/' + id)
      .then((res) => setGear(res.data || null))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleRentNow(e: React.FormEvent) {
    e.preventDefault();
    setRentError('');
    setRentSuccess(false);

    const token = Cookies.get('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    if (!startDate || !endDate) {
      setRentError('Please select both start and end dates.');
      return;
    }

    setRenting(true);
    try {
      await api.post('/rentals', {
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        items: [
          {
            gearItemId: id,
            quantity: 1,
          },
        ],
      });
      setRentSuccess(true);
    } catch (err: unknown) {
      setRentError(err instanceof Error ? err.message : 'Failed to create rental');
    } finally {
      setRenting(false);
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error || !gear) {
    return <div className="p-8 text-red-600">{error || 'Gear not found'}</div>;
  }

  const categoryName =
    typeof gear.category === 'string' ? gear.category : gear.category?.name || '';

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-400 rounded">
          {gear.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gear.imageUrl}
              alt={gear.name}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            'No image'
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{gear.name}</h1>
          <p className="text-gray-600">{categoryName}</p>
          {gear.provider && (
            <p className="text-sm text-gray-500 mt-1">
              Provided by {gear.provider.name}
            </p>
          )}
          <p className="text-xl font-semibold mt-4">${gear.pricePerDay}/day</p>
          {gear.description && <p className="mt-4 text-gray-700">{gear.description}</p>}

          <div className="mt-6 border-t pt-6">
            {!gear.available ? (
              <p className="text-gray-500">This item is currently unavailable.</p>
            ) : rentSuccess ? (
              <div className="bg-green-100 text-green-700 p-3 rounded text-sm">
                Rental order placed! Check your dashboard for status.
              </div>
            ) : (
              <form onSubmit={handleRentNow} className="space-y-3">
                <h2 className="font-semibold">Rent Now</h2>

                {rentError && (
                  <div className="bg-red-100 text-red-700 p-2 rounded text-sm">
                    {rentError}
                  </div>
                )}

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm mb-1">Start date</label>
                    <input
                      type="date"
                      min={today}
                      required
                      className="w-full border rounded px-2 py-1"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm mb-1">End date</label>
                    <input
                      type="date"
                      min={startDate || today}
                      required
                      className="w-full border rounded px-2 py-1"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={renting}
                  className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
                >
                  {renting ? 'Placing order...' : 'Rent Now'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}