"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import { api } from "@/lib/api";
import { gearCover } from "@/lib/images";
import { useToast } from "@/components/Toast";
import { Skeleton } from "@/components/Skeleton";

type Review = {
  id: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  customer?: { id: string; name: string };
};

type Gear = {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  pricePerDay: number;
  quantity: number;
  available: boolean;
  images?: string[];
  category?: { id: string; name: string } | string;
  provider?: { id: string; name: string };
  reviews?: Review[];
};

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="text-amber-500">
      {"★".repeat(full)}
      {"☆".repeat(Math.max(0, 5 - full))}
    </span>
  );
}

function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString();
}

export default function GearDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const [gear, setGear] = useState<Gear | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [rentError, setRentError] = useState("");
  const [rentSuccess, setRentSuccess] = useState(false);

  useEffect(() => {
    api
      .get<Gear>("/gear/" + id)
      .then((res) => {
        setGear(res.data || null);
        setSelectedImage(0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const images = gear?.images || [];
  const categoryName =
    typeof gear?.category === "string"
      ? gear?.category
      : gear?.category?.name || "";

  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    if (end < start) return 0;
    return Math.max(1, Math.round((end - start) / 86400000));
  }, [startDate, endDate]);

  const total = gear ? days * gear.pricePerDay * quantity : 0;

  const avgRating =
    gear && gear.reviews && gear.reviews.length > 0
      ? gear.reviews.reduce((sum, r) => sum + r.rating, 0) / gear.reviews.length
      : 0;

  const today = new Date().toISOString().split("T")[0];

  async function handleRentNow(e: React.FormEvent) {
    e.preventDefault();
    setRentError("");
    setRentSuccess(false);

    const token = Cookies.get("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }
    if (!startDate || !endDate) {
      setRentError("Please select both start and end dates.");
      toast("Please select both start and end dates.", "error");
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      setRentError("End date must be on or after the start date.");
      toast("End date must be on or after the start date.", "error");
      return;
    }

    setPlacing(true);
    try {
      await api.post("/rentals", {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        items: [{ gearItemId: gear!.id, quantity }],
      });
      setRentSuccess(true);
      toast("Rental order placed!", "success");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create rental";
      setRentError(message);
      toast(message, "error");
    } finally {
      setPlacing(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  if (error || !gear) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-red-600">{error || "Gear not found"}</p>
        <Link href="/gear" className="mt-4 inline-block text-sm underline">
          ← Back to gear
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/gear" className="text-sm underline">
        ← Back to gear
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-gray-400">
            <Image
              src={images.length > 0 ? images[selectedImage] : gearCover(images, gear.name, categoryName)}
              alt={gear.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-16 w-24 overflow-hidden rounded border ${
                    i === selectedImage
                      ? "border-black"
                      : "border-gray-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`${gear.name} ${i + 1}`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="mt-8">
            <h2 className="mb-2 text-xl font-semibold">About this gear</h2>
            <p className="text-gray-700">
              {gear.description || "No description provided."}
            </p>
            <dl className="mt-6 grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-gray-500">Category</dt>
                <dd className="font-medium">{categoryName || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Brand</dt>
                <dd className="font-medium">{gear.brand || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">In stock</dt>
                <dd className="font-medium">{gear.quantity}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Provided by</dt>
                <dd className="font-medium">{gear.provider?.name || "—"}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 border-t pt-6">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-xl font-semibold">Reviews</h2>
              {gear.reviews && gear.reviews.length > 0 && (
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <Stars rating={avgRating} />
                  {avgRating.toFixed(1)} ({gear.reviews.length})
                </span>
              )}
            </div>
            {gear.reviews && gear.reviews.length > 0 ? (
              <div className="space-y-4">
                {gear.reviews.map((review) => (
                  <div key={review.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {review.customer?.name || "Customer"}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <Stars rating={review.rating} />
                    {review.comment && (
                      <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No reviews yet.</p>
            )}
          </div>
        </div>

        <aside className="self-start rounded-lg border border-gray-200 p-6 lg:sticky lg:top-6">
          <h1 className="text-2xl font-bold">{gear.name}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {categoryName}
            {gear.brand ? ` · ${gear.brand}` : ""}
          </p>
          <p className="mt-3 text-xl font-semibold">${gear.pricePerDay}/day</p>

          <div className="mt-4 border-t pt-4">
            {!gear.available ? (
              <p className="text-gray-500">This item is currently unavailable.</p>
            ) : rentSuccess ? (
              <div className="rounded bg-green-100 p-3 text-sm text-green-700">
                Rental order placed! Track it from your dashboard. The provider
                will confirm, then you can pay.
              </div>
            ) : (
              <form onSubmit={handleRentNow} className="space-y-4">
                <h2 className="font-semibold">Rent Now</h2>

                {rentError && (
                  <div className="rounded bg-red-100 p-2 text-sm text-red-700">
                    {rentError}
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="start-date">
                    Start date
                  </label>
                  <input
                    id="start-date"
                    type="date"
                    min={today}
                    required
                    className="w-full rounded border px-3 py-2"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="end-date">
                    End date
                  </label>
                  <input
                    id="end-date"
                    type="date"
                    min={startDate || today}
                    required
                    className="w-full rounded border px-3 py-2"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="rental-qty">
                    Quantity
                  </label>
                  <select
                    id="rental-qty"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full rounded border px-3 py-2"
                  >
                    {Array.from({ length: Math.max(1, gear.quantity) }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                {days > 0 && (
                  <div className="flex items-center justify-between border-t pt-3 text-sm">
                    <span className="text-gray-600">
                      ${gear.pricePerDay} × {days} day{days === 1 ? "" : "s"} × {quantity}
                    </span>
                    <span className="text-lg font-semibold">${total}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={placing}
                  className="w-full rounded bg-black py-2.5 text-white disabled:opacity-50"
                >
                  {placing ? "Placing order..." : "Rent Now"}
                </button>
              </form>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
