"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import GearCard from "@/components/GearCard";
import { GearCardSkeleton, Skeleton } from "@/components/Skeleton";

type Category = { id: string; name: string };

type Gear = {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  pricePerDay: number;
  available: boolean;
  images?: string[];
  createdAt?: string;
  category?: { id: string; name: string } | string;
};

type Filters = {
  q: string;
  categories: string[];
  minPrice: string;
  maxPrice: string;
  brand: string;
  availableOnly: boolean;
  sort: string;
};

const DEFAULT_FILTERS: Filters = {
  q: "",
  categories: [],
  minPrice: "",
  maxPrice: "",
  brand: "",
  availableOnly: false,
  sort: "featured",
};

export default function GearPage() {
  const searchParams = useSearchParams();
  const [gear, setGear] = useState<Gear[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<Filters>(() => {
    const category = searchParams.get("category");
    return category ? { ...DEFAULT_FILTERS, categories: [category] } : DEFAULT_FILTERS;
  });

  useEffect(() => {
    Promise.all([api.get<Gear[]>("/gear"), api.get<Category[]>("/categories")])
      .then(([gearRes, catRes]) => {
        setGear(gearRes.data || []);
        setCategories(catRes.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const brands = useMemo(
    () =>
      Array.from(
        new Set(gear.map((g) => g.brand).filter((b): b is string => Boolean(b)))
      ).sort(),
    [gear]
  );

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    const list = gear.filter((item) => {
      const catName =
        typeof item.category === "string" ? item.category : item.category?.name || "";
      const catId =
        typeof item.category === "string" ? item.category : item.category?.id || "";

      if (q) {
        const haystack =
          `${item.name} ${item.brand || ""} ${catName} ${item.description || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.categories.length > 0 && !filters.categories.includes(catId)) {
        return false;
      }
      if (filters.minPrice && item.pricePerDay < Number(filters.minPrice)) {
        return false;
      }
      if (filters.maxPrice && item.pricePerDay > Number(filters.maxPrice)) {
        return false;
      }
      if (filters.brand && item.brand !== filters.brand) {
        return false;
      }
      if (filters.availableOnly && !item.available) {
        return false;
      }
      return true;
    });

    if (filters.sort === "price-asc") {
      list.sort((a, b) => a.pricePerDay - b.pricePerDay);
    } else if (filters.sort === "price-desc") {
      list.sort((a, b) => b.pricePerDay - a.pricePerDay);
    } else if (filters.sort === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }
    return list;
  }, [gear, filters]);

  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCategory(id: string) {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((c) => c !== id)
        : [...prev.categories, id],
    }));
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  const inputClass = "w-full border rounded px-3 py-2 text-sm";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Browse Gear</h1>
      <p className="mt-1 text-sm text-gray-600">
        {filtered.length} item{filtered.length === 1 ? "" : "s"} available
      </p>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6 self-start rounded-lg border border-gray-200 p-4 lg:sticky lg:top-6">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="gear-search">
              Search
            </label>
            <input
              id="gear-search"
              type="text"
              placeholder="Search gear, brand, category..."
              value={filters.q}
              onChange={(e) => update("q", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Categories</p>
            {categories.length === 0 ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Price per day</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => update("minPrice", e.target.value)}
                className={inputClass}
              />
              <span className="text-gray-400">—</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => update("maxPrice", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="brand-filter">
              Brand
            </label>
            <select
              id="brand-filter"
              value={filters.brand}
              onChange={(e) => update("brand", e.target.value)}
              className={inputClass}
            >
              <option value="">All brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.availableOnly}
              onChange={(e) => update("availableOnly", e.target.checked)}
            />
            Available now
          </label>

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="sort-filter">
              Sort by
            </label>
            <select
              id="sort-filter"
              value={filters.sort}
              onChange={(e) => update("sort", e.target.value)}
              className={inputClass}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            Clear filters
          </button>
        </aside>

        <div>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <GearCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border p-12 text-center">
              <p className="font-medium">No gear matches your filters</p>
              <button onClick={clearFilters} className="mt-2 text-sm underline">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => (
                <GearCard key={item.id} {...item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
