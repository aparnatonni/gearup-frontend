import Image from "next/image";
import Link from "next/link";
import { gearCover } from "@/lib/images";

type GearCardProps = {
  id: string;
  name: string;
  pricePerDay: number;
  brand?: string;
  category?: { id: string; name: string } | string;
  images?: string[];
  available: boolean;
};

export default function GearCard({
  id,
  name,
  pricePerDay,
  brand,
  category,
  images,
  available,
}: GearCardProps) {
  const categoryName =
    typeof category === "string" ? category : category?.name || "";
  const image = gearCover(images, name, categoryName);  return (
    <Link
      href={`/gear/${id}`}
      className="block overflow-hidden rounded-lg border border-gray-200 transition hover:shadow-md"
    >
      <div className="relative flex aspect-video w-full items-center justify-center bg-gray-100 text-gray-400">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">{name}</h3>
          <span
            className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${
              available
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {available ? "Available" : "Unavailable"}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          {categoryName}
          {brand ? ` · ${brand}` : ""}
        </p>
        <p className="mt-2 font-medium">${pricePerDay}/day</p>
      </div>
    </Link>
  );
}
