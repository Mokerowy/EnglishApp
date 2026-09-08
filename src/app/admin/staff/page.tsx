"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, Key, Trash2, ArrowLeft, X, Copy, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Teacher = {
  id: string;
  firstName: string;
  lastName: string;
  login: string;
  email: string | null;
  createdAt: string;
  isActive: boolean;
};

export default function StaffPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [newCredentials, setNewCredentials] = useState({ login: "", password: "" });

  // Add Form
  const [addForm, setAddForm] = useState({ firstName: "", lastName: "", email: "" });
  const [isAdding, setIsAdding] = useState(false);

  // Copy state
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await fetch("/api/admin/staff");
      if (res.ok) {
        const data = await res.json();
        setTeachers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm)
      });
      
      const data = await res.json();
      if (data.success) {
        setTeachers([data.user, ...teachers]);
        setNewCredentials(data.credentials);
        setShowAddModal(false);
        setAddForm({ firstName: "", lastName: "", email: "" });
        setShowCredentialsModal(true);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Błąd podczas dodawania");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tego nauczyciela?")) return;
    try {
      const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTeachers(teachers.filter(t => t.id !== id));
      }
    } catch (err) {
      alert("Błąd usuwania");
    }
  };

  const handleResetPassword = async (id: string) => {
    if (!confirm("Wygenerować nowe hasło dla tego nauczyciela? Poprzednie przestanie działać.")) return;
    try {
      const res = await fetch(`/api/admin/staff/${id}`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        const teacher = teachers.find(t => t.id === id);
        setNewCredentials({ login: teacher?.login || "", password: data.newPassword });
        setShowCredentialsModal(true);
      }
    } catch (err) {
      alert("Błąd resetowania hasła");
    }
  };

  const copyCredentials = () => {
    navigator.clipboard.writeText(`Login: ${newCredentials.login}\nHasło: ${newCredentials.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Zarządzanie Kadrą</h1>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-teal-600 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-teal-500 transition-all font-medium text-sm shadow-lg shadow-slate-900/20 dark:shadow-teal-900/20"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Dodaj Nauczyciela</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">Ładowanie...</div>
          ) : teachers.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Brak nauczycieli</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">Dodaj pierwszego nauczyciela do systemu, aby mógł rozpocząć pracę.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-xl transition-colors font-medium flex items-center gap-2 shadow-lg shadow-teal-500/20"
              >
                <UserPlus className="w-5 h-5" />
                Dodaj nauczyciela
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                    <th className="py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-300">Nauczyciel</th>
                    <th className="py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-300">Login Systemowy</th>
                    <th className="py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-300 hidden md:table-cell">E-mail (opcjonalny)</th>
                    <th className="py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-300 text-right">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {teachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">
                            {teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{teacher.firstName} {teacher.lastName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Zarejestrowano {new Date(teacher.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-medium text-sm border border-teal-100 dark:border-teal-800">
                          {teacher.login}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">
                        {teacher.email || <span className="italic text-slate-400">Brak</span>}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleResetPassword(teacher.id)}
                            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors"
                            title="Resetuj hasło"
                          >
                            <Key className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(teacher.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Usuń konto"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add Teacher Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nowy Nauczyciel</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddTeacher} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Imię</label>
                    <input
                      type="text"
                      required
                      value={addForm.firstName}
                      onChange={e => setAddForm({...addForm, firstName: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 dark:text-white transition-all"
                      placeholder="np. Jan"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nazwisko</label>
                    <input
                      type="text"
                      required
                      value={addForm.lastName}
                      onChange={e => setAddForm({...addForm, lastName: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 dark:text-white transition-all"
                      placeholder="np. Kowalski"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">E-mail (opcjonalny)</label>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={e => setAddForm({...addForm, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 dark:text-white transition-all"
                    placeholder="jan@kowalski.pl"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">E-mail nie jest wymagany. Nauczyciel będzie logował się wygenerowanym loginem.</p>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    {isAdding ? "Generowanie konta..." : "Dodaj i wygeneruj dane logowania"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Credentials Modal (Generated Password) */}
      <AnimatePresence>
        {showCredentialsModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-center p-8"
            >
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Key className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Dane Logowania</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
                To jest <span className="font-bold text-red-500">jedyny raz</span>, kiedy widzisz to hasło. Skopiuj je i przekaż nauczycielowi w bezpieczny sposób.
              </p>

              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-6 text-left border border-slate-200 dark:border-slate-700 mb-6">
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Login</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">{newCredentials.login}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Hasło</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">{newCredentials.password}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={copyCredentials}
                  className="flex-1 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5 text-teal-400" /> : <Copy className="w-5 h-5" />}
                  {copied ? "Skopiowano!" : "Kopiuj dane"}
                </button>
                <button
                  onClick={() => setShowCredentialsModal(false)}
                  className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
                >
                  Zamknij
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
