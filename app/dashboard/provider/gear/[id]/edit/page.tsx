"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { Skeleton } from "@/components/Skeleton";

type Category = {
  id: string;
  name: string;
};

type GearItem = {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  pricePerDay: number;
  quantity: number;
  available: boolean;
  images?: string[];
  categoryId?: string;
};

export default function EditGearPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const gearId = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    brand: "",
    description: "",
    pricePerDay: "",
    quantity: "1",
    available: true,
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    Promise.all([
      api.get<GearItem>(`/provider/gear/${gearId}`),
      api.get<Category[]>("/categories"),
    ])
      .then(([gearRes, catRes]) => {
        const gear = gearRes.data;
        if (gear) {
          setForm({
            name: gear.name,
            categoryId: gear.categoryId || "",
            brand: gear.brand || "",
            description: gear.description || "",
            pricePerDay: String(gear.pricePerDay),
            quantity: String(gear.quantity),
            available: gear.available,
          });
          setImageUrls(gear.images || []);
        }
        setCategories(catRes.data || []);
      })
      .catch((err) => toast(err.message, "error"))
      .finally(() => setLoading(false));
  }, [gearId, router, toast]);

  function addImage() {
    const url = imageInput.trim();
    if (url && !imageUrls.includes(url)) {
      setImageUrls((prev) => [...prev, url]);
    }
    setImageInput("");
  }

  function removeImage(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/provider/gear/${gearId}`, {
        name: form.name,
        categoryId: form.categoryId,
        brand: form.brand,
        description: form.description,
        pricePerDay: Number(form.pricePerDay),
        quantity: Number(form.quantity),
        available: form.available,
        images: imageUrls,
      });
      toast("Gear updated", "success");
      router.push("/dashboard/provider");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to update gear", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleAvailability() {
    setSaving(true);
    try {
      await api.put(`/provider/gear/${gearId}`, { available: !form.available });
      setForm((f) => ({ ...f, available: !f.available }));
      toast(form.available ? "Gear marked unavailable" : "Gear marked available", "success");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to update gear", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-md p-6">
        <Skeleton className="mb-6 h-8 w-40" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Edit Gear</h1>

      <div className="mb-6 flex items-center justify-between rounded border p-3">
        <span className="text-sm text-gray-600">Availability</span>
        <button
          type="button"
          onClick={handleToggleAvailability}
          disabled={saving}
          className={`rounded px-3 py-1 text-sm text-white disabled:opacity-50 ${
            form.available ? "bg-green-600" : "bg-gray-500"
          }`}
        >
          {form.available ? "Available" : "Unavailable"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input
            type="text"
            required
            className="w-full rounded border px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select
            required
            className="w-full rounded border px-3 py-2"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Brand</label>
          <input
            type="text"
            required
            className="w-full rounded border px-3 py-2"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            className="w-full rounded border px-3 py-2"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Price per day ($)</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              className="w-full rounded border px-3 py-2"
              value={form.pricePerDay}
              onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })}
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Quantity</label>
            <input
              type="number"
              required
              min="1"
              step="1"
              className="w-full rounded border px-3 py-2"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Image URLs</label>
          <div className="flex gap-2">
            <input
              type="url"
              className="flex-1 rounded border px-3 py-2"
              placeholder="https://..."
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addImage();
                }
              }}
            />
            <button
              type="button"
              onClick={addImage}
              className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Add
            </button>
          </div>
          {imageUrls.length > 0 && (
            <ul className="mt-2 space-y-1">
              {imageUrls.map((url) => (
                <li key={url} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-gray-600">{url}</span>
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="text-red-600 underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
