"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ShieldAlert, Users, DollarSign, TrendingUp, ChevronLeft, CreditCard, Bell, Calendar as CalendarIcon, CheckCircle2, Layers, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePersistentState } from "@/hooks/usePersistentState";
import { signOut } from "next-auth/react";

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];

  const [notifications, setNotifications] = usePersistentState('app-notifications', [
    { id: 1, type: 'warning', title: 'Zaległe płatności', description: 'Jan Kowalski (Angielski B1) zalega z płatnością na kwotę 450 zł za 2 miesiące.', date: '10 min temu', actionLink: '/admin/students/s1', studentId: 's1' },
    { id: 2, type: 'alert', title: 'Prośba o zastępstwo', description: 'Anna Kowalska prosi o zastępstwo na jutro (Angielski A2, 17:00).', date: '1 godzinę temu', actionLink: `/admin/calendar?teacher=Anna%20Kowalska&highlightEventId=4&date=${dateStr}`, teacherId: 't1' },
    { id: 3, type: 'info', title: 'Nowy uczeń', description: 'Zofia Dąbrowska dołączyła do grupy Angielski B1.', date: '3 godziny temu', actionLink: '/admin/students/s7', studentId: 's7' }
  ]);

  const dismissNotification = (id: number) => {
    setNotifications(notifications.filter((n: any) => n.id !== id));
  };

  const containerVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ChevronLeft className="w-8 h-8" />
            </Link>
            <div>
              <h1 className="font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">Pulpit Właściciela</h1>
              <p className="text-base text-slate-500 dark:text-slate-400 mt-1">Główne centrum dowodzenia</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors font-medium text-sm"
            >
              <LogOut className="w-4 h-4" /> Wyloguj
            </button>
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="sm:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 sm:mt-12">
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show"
          className="space-y-8"
        >
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center shrink-0">
                <DollarSign className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Przychód (Ten msc.)</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">45 200 zł</p>
                <p className="text-sm text-emerald-500 font-medium mt-1">↑ 12% od zeszłego msc.</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Aktywni Uczniowie</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">142</p>
                <p className="text-sm text-emerald-500 font-medium mt-1">+5 nowych</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center shrink-0">
                <CreditCard className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Zaległe Płatności</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">3 150 zł</p>
                <p className="text-sm text-red-500 font-medium mt-1">7 uczniów zalega</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0">
                <TrendingUp className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Lekcje w tygodniu</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">48</p>
                <p className="text-sm text-emerald-500 font-medium mt-1">Wszystko zgodnie z planem</p>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Action Required Board */}
            <motion.div variants={itemVariants} className="lg:col-span-1 flex flex-col h-full">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Bell className="w-6 h-6 text-amber-500" /> Do zrobienia
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Powiadomienia i wnioski systemowe</p>
                </div>
                
                <div className="p-4 flex-1 overflow-y-auto">
                  <AnimatePresence>
                    {notifications.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4"
                      >
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Wszystko załatwione!</h3>
                        <p className="text-slate-500 dark:text-slate-400">Nie masz żadnych palących spraw do rozwiązania na ten moment.</p>
                      </motion.div>
                    ) : (
                      notifications.map(n => (
                        <motion.div 
                          key={n.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                          className={`mb-4 p-4 rounded-2xl border-l-4 shadow-sm flex flex-col ${
                            n.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-500' :
                            n.type === 'alert' ? 'bg-red-50 dark:bg-red-900/10 border-red-500' :
                            'bg-blue-50 dark:bg-blue-900/10 border-blue-500'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-900 dark:text-white">{n.title}</h4>
                            <span className="text-xs font-medium text-slate-400">{n.date}</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{n.description}</p>
                          <div className="flex gap-2 mt-auto">
                            {n.teacherId ? (
                              <Link href={n.actionLink || `/teacher?highlightEventId=4`} className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 font-bold text-sm bg-pink-50 dark:bg-pink-900/30 px-3 py-1.5 rounded-lg transition-colors text-center flex-1">
                                Sprawdź Grafik
                              </Link>
                            ) : n.studentId ? (
                              <Link href={`/admin/students/${n.studentId}`} className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-bold text-sm bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg transition-colors text-center flex-1">
                                Profil Ucznia
                              </Link>
                            ) : n.actionLink && (
                              <Link 
                                href={n.actionLink}
                                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex-1 text-center"
                              >
                                Szczegóły
                              </Link>
                            )}
                            <button 
                              onClick={() => dismissNotification(n.id)}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/60 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200"
                            >
                              Zrobione
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Quick Links Menu */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col justify-center">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Zarządzanie Aplikacją</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Szybki dostęp do modułów szkoły</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <Link href="/admin/students" className="p-6 border-2 border-slate-100 dark:border-slate-800 hover:border-violet-400 dark:hover:border-violet-600 hover:shadow-lg hover:shadow-violet-500/10 rounded-2xl transition-all group flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="w-14 h-14 bg-white dark:bg-slate-900 shadow-sm group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50 rounded-xl flex items-center justify-center shrink-0 transition-colors border border-slate-200 dark:border-slate-700">
                      <Users className="w-7 h-7 text-slate-600 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Baza Uczniów</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">Dodawaj, edytuj i przypisuj uczniów do grup.</p>
                    </div>
                  </Link>

                  <Link href="/admin/groups" className="p-6 border-2 border-slate-100 dark:border-slate-800 hover:border-pink-400 dark:hover:border-pink-600 hover:shadow-lg hover:shadow-pink-500/10 rounded-2xl transition-all group flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="w-14 h-14 bg-white dark:bg-slate-900 shadow-sm group-hover:bg-pink-100 dark:group-hover:bg-pink-900/50 rounded-xl flex items-center justify-center shrink-0 transition-colors border border-slate-200 dark:border-slate-700">
                      <Layers className="w-7 h-7 text-slate-600 dark:text-slate-400 group-hover:text-pink-600 dark:group-hover:text-pink-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Baza Grup</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">Zarządzaj grupami, poziomami i uczniami.</p>
                    </div>
                  </Link>

                  <Link href="/admin/finances" className="p-6 border-2 border-slate-100 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg hover:shadow-blue-500/10 rounded-2xl transition-all group flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="w-14 h-14 bg-white dark:bg-slate-900 shadow-sm group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 rounded-xl flex items-center justify-center shrink-0 transition-colors border border-slate-200 dark:border-slate-700">
                      <DollarSign className="w-7 h-7 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Rozliczenia i Cennik</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">Generuj faktury i ustalaj ceny za kursy.</p>
                    </div>
                  </Link>

                  <Link href="/admin/staff" className="p-6 border-2 border-slate-100 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-lg hover:shadow-amber-500/10 rounded-2xl transition-all group flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="w-14 h-14 bg-white dark:bg-slate-900 shadow-sm group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 rounded-xl flex items-center justify-center shrink-0 transition-colors border border-slate-200 dark:border-slate-700">
                      <ShieldAlert className="w-7 h-7 text-slate-600 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Kadra i Uprawnienia</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">Zarządzaj dostępami dla nauczycieli.</p>
                    </div>
                  </Link>

                  <Link href="/admin/calendar" className="p-6 border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-500/10 rounded-2xl transition-all group flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="w-14 h-14 bg-white dark:bg-slate-900 shadow-sm group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 rounded-xl flex items-center justify-center shrink-0 transition-colors border border-slate-200 dark:border-slate-700">
                      <CalendarIcon className="w-7 h-7 text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Grafik Zajęć</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">Przeglądaj interaktywny plan lekcji.</p>
                    </div>
                  </Link>

                  <Link href="/admin/vacations" className="p-6 border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/10 rounded-2xl transition-all group flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="w-14 h-14 bg-white dark:bg-slate-900 shadow-sm group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 rounded-xl flex items-center justify-center shrink-0 transition-colors border border-slate-200 dark:border-slate-700">
                      <svg className="w-7 h-7 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Urlopy Kadry</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">Zatwierdzaj i odrzucaj wnioski urlopowe.</p>
                    </div>
                  </Link>

                  <Link href="/admin/approvals" className="p-6 border-2 border-slate-100 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-lg hover:shadow-teal-500/10 rounded-2xl transition-all group flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="w-14 h-14 bg-white dark:bg-slate-900 shadow-sm group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 rounded-xl flex items-center justify-center shrink-0 transition-colors border border-slate-200 dark:border-slate-700">
                      <ShieldAlert className="w-7 h-7 text-slate-600 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Oczekujący Uczniowie</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">Zatwierdzaj konta nowych uczniów.</p>
                    </div>
                  </Link>

                  <Link href="/admin/staff" className="p-6 border-2 border-slate-100 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-lg hover:shadow-teal-500/10 rounded-2xl transition-all group flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="w-14 h-14 bg-white dark:bg-slate-900 shadow-sm group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 rounded-xl flex items-center justify-center shrink-0 transition-colors border border-slate-200 dark:border-slate-700">
                      <Users className="w-7 h-7 text-slate-600 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Kadra Nauczycielska</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">Zarządzaj nauczycielami i ich dostępem.</p>
                    </div>
                  </Link>

                </div>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}
