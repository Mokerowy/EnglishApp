"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, UserCheck, Loader2 } from "lucide-react";

type PendingUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
};

export default function ApprovalsPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users/pending");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (id: string) => {
    try {
      const res = await fetch("/api/admin/users/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Oczekujący Użytkownicy</h1>
          <p className="text-slate-500 dark:text-slate-400">Zarządzaj nowymi rejestracjami</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border-2 border-slate-200 dark:border-slate-800 border-dashed">
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400">Brak oczekujących użytkowników do zatwierdzenia.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Użytkownik</th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Email</th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Rola</th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold tracking-wide">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => approveUser(user.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 font-semibold rounded-lg transition-colors"
                    >
                      <UserCheck className="w-4 h-4" /> Zatwierdź
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
