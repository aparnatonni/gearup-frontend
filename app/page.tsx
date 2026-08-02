"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import GearCard from "@/components/GearCard";
import { GearCardSkeleton } from "@/components/Skeleton";

type Category = { id: string; name: string };

type Gear = {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  pricePerDay: number;
  available: boolean;
  images?: string[];
  category?: { id: string; name: string } | string;
};

export default function HomePage() {
  const [gear, setGear] = useState<Gear[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get<Gear[]>("/gear"), api.get<Category[]>("/categories")])
      .then(([gearRes, catRes]) => {
        setGear(gearRes.data || []);
        setCategories(catRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const featured = [...gear]
    .sort((a, b) => Number(b.available) - Number(a.available))
    .slice(0, 6);

  return (
    <div>
      <section className="bg-gradient-to-br from-gray-900 to-gray-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">
            Rent Sports & Outdoor Gear Instantly
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-200">
            Camping, cycling, water sports and more — book top-quality equipment
            by the day without the cost of ownership.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/gear"
              className="rounded bg-white px-6 py-3 font-medium text-gray-900"
            >
              Browse Gear
            </Link>
            <Link
              href="/auth/register"
              className="rounded border border-white/40 px-6 py-3 font-medium hover:bg-white/10"
            >
              List Your Gear
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Gear</h2>
          <Link href="/gear" className="text-sm underline">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <GearCardSkeleton key={i} />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <p className="text-gray-600">No gear available yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {featured.map((item) => (
              <GearCard key={item.id} {...item} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="mb-6 text-2xl font-bold">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/gear?category=${cat.id}`}
                className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-medium hover:bg-black hover:text-white"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold">How It Works</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Pick your dates",
              text: "Choose a start and end date for any gear you like.",
            },
            {
              step: "2",
              title: "Book & pay",
              text: "Place your rental and pay securely with Stripe.",
            },
            {
              step: "3",
              title: "Pick up & enjoy",
              text: "Collect your gear and get out there.",
            },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-black text-lg font-bold text-white">
                {s.step}
              </div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
