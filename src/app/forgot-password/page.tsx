"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles, ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors flex flex-col">
      <header className="p-6 max-w-7xl w-full mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-2xl text-slate-900 dark:text-white">Effective English</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Odzyskiwanie hasła</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl shadow-blue-500/10">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Powrót do logowania
            </Link>

            {success ? (
              <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Sprawdź swoją skrzynkę
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Jeśli podany e-mail lub login istnieje w naszej bazie, wysłaliśmy na niego link do zresetowania hasła.
                </p>
                <Link 
                  href="/"
                  className="w-full py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-bold text-lg flex items-center justify-center transition-colors"
                >
                  Wróć na stronę główną
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                    Zapomniałeś hasła?
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Podaj swój adres e-mail lub login, a wyślemy Ci instrukcje resetowania hasła.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white ml-1">
                      Adres e-mail lub login
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-0 focus:border-blue-500 dark:focus:border-blue-500 transition-colors text-slate-900 dark:text-white"
                        placeholder="jan@kowalski.pl"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      "Wyślij link resetujący"
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
