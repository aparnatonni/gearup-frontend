"use client";

import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { Skeleton, RowSkeleton } from "@/components/Skeleton";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt?: string;
};

const PAGE_SIZE = 8;

export default function AdminUsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    api
      .get<AdminUser[]>("/admin/users")
      .then((res) => setUsers(res.data || []))
      .catch((err) => toast(err.message, "error"))
      .finally(() => setLoading(false));
  }, [router, toast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedUsers = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function handleToggleStatus(u: AdminUser) {
    const nextStatus = u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setActionId(u.id);
    try {
      await api.patch(`/admin/users/${u.id}`, { status: nextStatus });
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, status: nextStatus } : x))
      );
      toast(nextStatus === "SUSPENDED" ? "User suspended" : "User activated", "success");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to update user", "error");
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-8">
        <Skeleton className="mb-6 h-8 w-56" />
        <Skeleton className="mb-4 h-10 w-full" />
        <div className="overflow-hidden rounded border">
          {Array.from({ length: 6 }).map((_, i) => (
            <RowSkeleton key={i} columns={6} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-2xl font-bold">User Management</h1>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 rounded border px-3 py-2"
        />
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="rounded border px-3 py-2"
        >
          <option value="ALL">All Roles</option>
          <option value="CUSTOMER">Customers</option>
          <option value="PROVIDER">Providers</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Joined</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {pagedUsers.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2 font-medium">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs">{u.role}</span>
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      u.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-600">
                  {u.createdAt?.split("T")[0] || "-"}
                </td>
                <td className="px-4 py-2 text-right">
                  {u.role !== "ADMIN" && (
                    <button
                      onClick={() => handleToggleStatus(u)}
                      disabled={actionId === u.id}
                      className="rounded border px-3 py-1 text-xs hover:bg-gray-50 disabled:opacity-50"
                    >
                      {actionId === u.id
                        ? "Updating..."
                        : u.status === "ACTIVE"
                          ? "Suspend"
                          : "Activate"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {pagedUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No users match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="rounded border px-3 py-1 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {safePage} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="rounded border px-3 py-1 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
