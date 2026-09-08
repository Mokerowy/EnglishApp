"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChevronLeft, Coffee, Check, X, Calendar as CalendarIcon } from "lucide-react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { mockSchedules, mockTeachers, defaultCalendarEvents } from "@/lib/mockData";
import { SchoolCalendar } from "@/components/SchoolCalendar";
import { Views } from "react-big-calendar";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminVacationsPage() {
  const [schedules, setSchedules] = usePersistentState('app-schedules', mockSchedules);
  const [teachers] = usePersistentState('app-teachers', mockTeachers);
  const [selectedHolidayForSchedule, setSelectedHolidayForSchedule] = useState<any>(null);
  
  const holidays = schedules.filter((s: any) => s.type === "Holiday");
  const pendingHolidays = holidays.filter((h: any) => h.status === "pending");
  const approvedHolidays = holidays.filter((h: any) => h.status === "approved" || h.status === "rejected");

  const getTeacherName = (id: string) => teachers.find((t: any) => t.id === id)?.name || "Nieznany";

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    if (e < s) return 0;
    
    let days = 0;
    const current = new Date(s);
    while (current <= e) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days++;
      }
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const updateHolidayStatus = (id: string, status: "approved" | "rejected") => {
    setSchedules(schedules.map((s: any) => s.id === id ? { ...s, status } : s));
  };

  const scheduleEvents = selectedHolidayForSchedule ? [
    ...defaultCalendarEvents.filter(e => e.teacherId === selectedHolidayForSchedule.teacherId),
    {
      id: 'vacation-highlight',
      title: 'WNIOSEK URLOPOWY',
      start: new Date(selectedHolidayForSchedule.startDate),
      end: new Date(new Date(selectedHolidayForSchedule.endDate).setHours(23, 59, 59)),
      allDay: true,
      color: '#eab308', // Tailwind yellow-500
    }
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-20">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ChevronLeft className="w-8 h-8" />
            </Link>
            <div>
              <h1 className="font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">Zarządzanie Urlopami</h1>
              <p className="text-base text-slate-500 dark:text-slate-400 mt-1">Wnioski urlopowe kadry</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        <div className="grid gap-8">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <Coffee className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nowe Wnioski ({pendingHolidays.length})</h2>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {pendingHolidays.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  Brak nowych wniosków o urlop.
                </div>
              ) : (
                pendingHolidays.map((holiday: any) => (
                  <div key={holiday.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">{getTeacherName(holiday.teacherId)}</h3>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Termin: <span className="font-medium text-slate-700 dark:text-slate-300">{holiday.startDate} - {holiday.endDate}</span> ({calculateDays(holiday.startDate, holiday.endDate)} dni)
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button 
                        onClick={() => setSelectedHolidayForSchedule(holiday)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <CalendarIcon className="w-4 h-4" /> Grafik
                      </button>
                      <button 
                        onClick={() => updateHolidayStatus(holiday.id, "approved")}
                        className="flex-1 md:flex-none px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" /> Zatwierdź
                      </button>
                      <button 
                        onClick={() => updateHolidayStatus(holiday.id, "rejected")}
                        className="flex-1 md:flex-none px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" /> Odrzuć
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Historia Wniosków</h2>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {approvedHolidays.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  Brak historii wniosków.
                </div>
              ) : (
                approvedHolidays.map((holiday: any) => (
                  <div key={holiday.id} className="p-6 flex flex-col md:flex-row justify-between gap-4 items-center">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">{getTeacherName(holiday.teacherId)}</h3>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Termin: <span className="font-medium text-slate-700 dark:text-slate-300">{holiday.startDate} - {holiday.endDate}</span> ({calculateDays(holiday.startDate, holiday.endDate)} dni)
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setSelectedHolidayForSchedule(holiday)}
                        className="p-2 bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Zobacz na grafiku"
                      >
                        <CalendarIcon className="w-5 h-5" />
                      </button>
                      {holiday.status === "approved" ? (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-lg font-bold text-sm">Zatwierdzony</span>
                      ) : (
                        <span className="px-3 py-1 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg font-bold text-sm">Odrzucony</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Schedule Modal */}
      <AnimatePresence>
        {selectedHolidayForSchedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CalendarIcon className="w-6 h-6 text-amber-500" /> Grafik kolidujący z urlopem
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Nauczyciel: {getTeacherName(selectedHolidayForSchedule.teacherId)}</p>
                </div>
                <button onClick={() => setSelectedHolidayForSchedule(null)} className="text-slate-500 hover:text-slate-700 bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <div className="inline-block bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl border border-amber-200 dark:border-amber-800/50">
                  <span className="font-bold text-amber-700 dark:text-amber-400">
                    Prośba o urlop: {selectedHolidayForSchedule.startDate} - {selectedHolidayForSchedule.endDate}
                  </span>
                </div>
              </div>

              <SchoolCalendar 
                events={scheduleEvents} 
                defaultView={Views.WEEK}
                defaultDate={new Date(selectedHolidayForSchedule.startDate)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
