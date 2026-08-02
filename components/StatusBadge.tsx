export const STATUS_STYLES: Record<string, string> = {
  PLACED: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PAID: "bg-purple-100 text-purple-800",
  PICKED_UP: "bg-green-100 text-green-800",
  RETURNED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded px-2 py-1 text-xs font-medium ${
        STATUS_STYLES[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

export function nextProviderAction(order: { status: string }) {
  if (order.status === "PLACED") return { label: "Confirm", status: "CONFIRMED" };
  if (order.status === "PAID") return { label: "Mark Picked Up", status: "PICKED_UP" };
  if (order.status === "PICKED_UP") return { label: "Mark Returned", status: "RETURNED" };
  return null;
}
