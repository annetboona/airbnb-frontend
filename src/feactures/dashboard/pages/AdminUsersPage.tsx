import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import api from "../../../lib/axios"

interface UserRow {
  id: string
  name: string
  email: string
  username: string
  role: string
}

interface UsersResponse {
  data: UserRow[]
  meta?: { total?: number; page?: number }
}

export default function AdminUsersPage() {
  const q = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await api.get<UsersResponse>("/users")
      return data
    },
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All users</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Role badges and search (client-side).</p>
      <UserTable data={q.data} loading={q.isLoading} error={q.isError} onRetry={() => q.refetch()} />
    </div>
  )
}

function UserTable({
  data,
  loading,
  error,
  onRetry,
}: {
  data?: UsersResponse
  loading: boolean
  error: boolean
  onRetry: () => void
}) {
  const [q, setQ] = useState("")

  if (loading) return <p className="text-gray-500 text-sm">Loading users…</p>
  if (error)
    return (
      <button type="button" className="text-orange-500 text-sm underline" onClick={onRetry}>
        Failed to load — retry
      </button>
    )

  const rows =
    data?.data?.filter((u) => `${u.name} ${u.email} ${u.username} ${u.role}`.toLowerCase().includes(q.toLowerCase())) ??
    []

  return (
    <>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search users…"
        className="max-w-xs w-full rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 text-sm"
      />
      <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 text-left text-xs uppercase text-gray-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {rows.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.role === "ADMIN" ? "bg-red-100 text-red-700" : u.role === "HOST" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400">
        {data?.meta?.total != null ? `${data.meta.total} users (server total)` : `${rows.length} shown`}
      </p>
    </>
  )
}
