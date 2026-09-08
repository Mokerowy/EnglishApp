"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CreditCard, Calendar, BookOpen, GraduationCap, ChevronLeft, CheckCircle2, Clock, Send, AlertTriangle, X, LogOut } from "lucide-react";
import { SchoolCalendar } from "@/components/SchoolCalendar";
import { Views } from "react-big-calendar";
import { motion, AnimatePresence } from "framer-motion";
import { mockSchedules, mockTeachers } from "@/lib/mockData";
import { usePersistentState } from "@/hooks/usePersistentState";
import { signOut } from "next-auth/react";

export default function ClientDashboard() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const [activeTab, setActiveTab] = useState<"zajecia" | "finanse">("zajecia");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const now = new Date();
  const [myEvents, setMyEvents] = useState([
    { id: 0, title: 'Język Angielski - Poziom B1 (A. Kowalska)', start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3, 16, 0), end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3, 17, 0), absenceReported: false },
    { id: 1, title: 'Język Angielski (Konwersacje) (J. Smith)', start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0), end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0), absenceReported: false },
    { id: 2, title: 'Język Angielski - Poziom B1 (A. Kowalska)', start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 16, 0), end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 17, 0), absenceReported: false },
    { id: 3, title: 'Język Angielski (Konwersacje) (J. Smith)', start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 18, 0), end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 19, 0), absenceReported: false },
  ]);

  const [notifications, setNotifications] = usePersistentState<any[]>('app-notifications', []);

  const [classFilter, setClassFilter] = useState<"nadchodzace" | "trwajace" | "zrealizowane">("nadchodzace");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  
  const nowTime = now.getTime();
  const displayedClasses = myEvents.filter(e => {
    if (classFilter === "nadchodzace") return e.start.getTime() > nowTime;
    if (classFilter === "zrealizowane") return e.end.getTime() < nowTime;
    if (classFilter === "trwajace") return e.start.getTime() <= nowTime && e.end.getTime() >= nowTime;
    return false;
  }).sort((a, b) => classFilter === "zrealizowane" ? b.start.getTime() - a.start.getTime() : a.start.getTime() - b.start.getTime());

  // Stany dla algorytmu proponowania terminu
  const [suggestModalOpen, setSuggestModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "unavailable" | "sent">("idle");

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end });
    setStatus("idle");
    setSuggestModalOpen(true);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
  };

  const reportAbsence = () => {
    if (selectedEvent) {
      setMyEvents(myEvents.map(e => e.id === selectedEvent.id ? { ...e, absenceReported: true, title: `[NIEOBECNY] ${e.title}` } : e));
      setSelectedEvent({ ...selectedEvent, absenceReported: true });
      
      const newNotification = {
        id: Date.now(),
        type: 'warning',
        title: 'Nieobecność Ucznia',
        description: `Tomasz (Twój uczeń) zgłosił nieobecność na zajęciach: ${selectedEvent.title} w dniu ${selectedEvent.start.toLocaleDateString('pl-PL')}.`,
        date: 'Przed chwilą',
        actionLink: `/admin/students/s1` // Mock student
      };
      
      setNotifications([newNotification, ...notifications]);
      alert("Zgłoszono nieobecność. Nauczyciel i szkoła zostali powiadomieni.");
    }
  };

  const checkAvailability = () => {
    if (!selectedSlot) return;
    setStatus("checking");
    
    const dayOfWeek = selectedSlot.start.getDay(); // 0 = Niedziela, 1 = Poniedziałek, etc.
    const startHourNum = selectedSlot.start.getHours() + (selectedSlot.start.getMinutes() / 60);
    const endHourNum = selectedSlot.end.getHours() + (selectedSlot.end.getMinutes() / 60);

    setTimeout(() => {
      // Pobieramy wszystkich nauczycieli
      const allTeacherIds = mockTeachers.map(t => t.id);
      
      // Znajdź zajętych nauczycieli w danym terminie
      const busyTeacherIds = mockSchedules.filter(s => {
        if (s.dayOfWeek !== dayOfWeek) return false;
        
        // Sprawdź konflikt czasowy
        const conflict = (startHourNum < s.endHour) && (s.startHour < endHourNum);
        return conflict;
      }).map(s => s.teacherId);

      const uniqueBusyIds = Array.from(new Set(busyTeacherIds));

      if (uniqueBusyIds.length >= allTeacherIds.length) {
        setStatus("unavailable");
      } else {
        setStatus("available");
      }
    }, 800); 
  };

  const submitRequest = () => {
    setStatus("sent");
    setTimeout(() => {
      setStatus("idle");
      setSuggestModalOpen(false);
    }, 3000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-20">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ChevronLeft className="w-8 h-8" />
            </Link>
            <div>
              <h1 className="font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">Witaj, Tomasz! 👋</h1>
              <p className="text-base text-slate-500 dark:text-slate-400 mt-1">Twój Panel Ucznia</p>
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

      <main className="max-w-5xl mx-auto px-4 mt-8 sm:mt-12">
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <button 
            onClick={() => setActiveTab("zajecia")}
            className={`flex-1 p-5 rounded-2xl flex items-center justify-center gap-3 text-xl font-bold transition-all border-2 ${
            activeTab === "zajecia" 
              ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20" 
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800"
          }`}>
            <Calendar className="w-7 h-7" /> Moje Zajęcia
          </button>
          
          <button 
            onClick={() => setActiveTab("finanse")}
            className={`flex-1 p-5 rounded-2xl flex items-center justify-center gap-3 text-xl font-bold transition-all border-2 ${
            activeTab === "finanse" 
              ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20" 
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800"
          }`}>
            <CreditCard className="w-7 h-7" /> Płatności
          </button>
        </div>

        {activeTab === "zajecia" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                <div className="flex-1">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-blue-500" /> Twoje Lekcje
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Przeglądaj swoje lekcje i zgłaszaj nieobecności.</p>
                </div>
                
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-center shrink-0">
                  <button 
                    onClick={() => setViewMode("list")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === "list" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                  >
                    Lista
                  </button>
                  <button 
                    onClick={() => setViewMode("calendar")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === "calendar" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                  >
                    Kalendarz
                  </button>
                </div>
              </div>

              {viewMode === "calendar" ? (
                <div className="w-full flex flex-col">
                  <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Kliknij w puste miejsce na kalendarzu, aby zaproponować nowy termin zajęć dodatkowych!</p>
                  <SchoolCalendar 
                    events={myEvents.map(e => ({...e, reported: e.absenceReported}))} 
                    defaultView={Views.WEEK} 
                    selectable={true}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                  />
                </div>
              ) : (
                <>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start mb-6 overflow-x-auto w-full sm:w-auto shrink-0">
                    <button 
                      onClick={() => setClassFilter("nadchodzace")}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${classFilter === "nadchodzace" ? "bg-blue-500 text-white shadow-md" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                    >
                      Przyszłe
                    </button>
                    <button 
                      onClick={() => setClassFilter("trwajace")}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${classFilter === "trwajace" ? "bg-emerald-500 text-white shadow-md" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                    >
                      Teraźniejsze
                    </button>
                    <button 
                      onClick={() => setClassFilter("zrealizowane")}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${classFilter === "zrealizowane" ? "bg-slate-500 text-white shadow-md" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                    >
                      Przeszłe
                    </button>
                  </div>
                  
                  <div className="overflow-y-auto pr-2 space-y-4 max-h-[600px] min-h-[400px]">
                    <AnimatePresence mode="popLayout">
                      {displayedClasses.length === 0 ? (
                        <motion.div 
                          key="empty"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="h-full flex flex-col items-center justify-center text-center p-8"
                        >
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <BookOpen className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 font-medium">Brak zajęć w tej kategorii.</p>
                        </motion.div>
                      ) : (
                        displayedClasses.map(cls => (
                          <motion.div 
                            key={cls.id}
                            layout
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            onClick={() => handleSelectEvent(cls)}
                            className={`p-5 rounded-2xl border-l-4 shadow-sm cursor-pointer transition-all hover:-translate-y-1 ${
                              classFilter === "nadchodzace" ? "bg-blue-50 dark:bg-blue-900/10 border-blue-500 hover:shadow-blue-500/20" :
                              classFilter === "trwajace" ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500 hover:shadow-emerald-500/20" :
                              "bg-slate-50 dark:bg-slate-800/50 border-slate-500 hover:shadow-slate-500/20"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                              <div>
                                <h3 className={`font-bold text-lg mb-1 flex items-center gap-2 ${
                                  classFilter === "nadchodzace" ? "text-blue-900 dark:text-blue-100" :
                                  classFilter === "trwajace" ? "text-emerald-900 dark:text-emerald-100" :
                                  "text-slate-700 dark:text-slate-300"
                                }`}>
                                  {cls.title}
                                  {cls.absenceReported && <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md">Nieobecność</span>}
                                </h3>
                                <div className="flex items-center gap-4 text-sm font-medium opacity-80">
                                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {cls.start.toLocaleDateString('pl-PL')}</span>
                                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatTime(cls.start)} - {formatTime(cls.end)}</span>
                                </div>
                              </div>
                              
                              {classFilter === "nadchodzace" && !cls.absenceReported && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleSelectEvent(cls); }}
                                  className="self-start sm:self-center bg-white dark:bg-slate-900 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 hover:text-red-600 dark:hover:text-red-400 transition-colors shrink-0"
                                >
                                  Zgłoś nieobecność
                                </button>
                              )}
                              {classFilter === "trwajace" && (
                                <span className="self-start sm:self-center flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-lg text-sm font-bold shrink-0">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Trwają
                                </span>
                              )}
                              {classFilter === "zrealizowane" && (
                                <span className="self-start sm:self-center flex items-center gap-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-lg text-sm font-bold shrink-0">
                                  <CheckCircle2 className="w-4 h-4" /> Odbyte
                                </span>
                              )}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-blue-500" /> Twój pakiet lekcji
              </h2>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 text-center sm:text-left">
                <div className="w-32 h-32 rounded-full border-8 border-blue-100 dark:border-slate-800 flex items-center justify-center relative shrink-0">
                  <div className="absolute inset-0 rounded-full border-8 border-blue-500" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 50%)" }}></div>
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white relative z-10">8</span>
                </div>
                <div className="flex-1 mt-4 sm:mt-0">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Zostało Ci 8 lekcji do wykorzystania</p>
                  <p className="text-lg text-slate-600 dark:text-slate-400">z pakietu 24 lekcji wykupionych na ten semestr.</p>
                  <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Pamiętaj, aby wykorzystać je przed końcem czerwca!</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === "finanse" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-blue-500" /> Wymagane płatności
              </h2>
              
              {!paymentSuccess ? (
                <div className="border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-3xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div>
                    <span className="inline-block px-4 py-2 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 font-bold rounded-xl text-base mb-4">
                      ⚠ Termin minął wczoraj
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Rata za kurs językowy - Lipiec</h3>
                    <p className="text-lg text-slate-600 dark:text-slate-400">Numer dokumentu: FV/2026/07/12</p>
                  </div>
                  <div className="flex flex-col md:items-end gap-4">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white">350,00 zł</span>
                    <button 
                      onClick={() => setPaymentSuccess(true)}
                      className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xl shadow-lg shadow-blue-600/20 transition-all w-full md:w-auto text-center"
                    >
                      Opłać szybko (BLIK)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-16 h-16" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Płatność zakończona sukcesem!</h3>
                  <p className="text-xl text-slate-600 dark:text-slate-400">Dziękujemy. Twoja wpłata została zaksięgowana, a faktura jest uregulowana.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Modal - Proponowanie Terminu z Algorytmem */}
      <AnimatePresence>
        {suggestModalOpen && selectedSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-blue-500" /> Zaproponuj termin
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Chcesz zająć ten termin na dodatkowe zajęcia?</p>
                </div>
                <button onClick={() => setSuggestModalOpen(false)} className="text-slate-500 hover:text-slate-700 bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6 flex flex-col gap-2">
                <p className="text-slate-500 dark:text-slate-400 font-medium">Wybrany czas:</p>
                <div className="flex items-center gap-3 text-lg font-bold text-slate-900 dark:text-white">
                  <Clock className="w-5 h-5 text-blue-500" />
                  {selectedSlot.start.toLocaleDateString('pl-PL')} ({['Ndz', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'][selectedSlot.start.getDay()]}) <br/>
                  {formatTime(selectedSlot.start)} - {formatTime(selectedSlot.end)}
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                <button
                  onClick={checkAvailability}
                  disabled={status === "checking" || status === "sent"}
                  className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === "checking" ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sprawdzanie dostępności...
                    </span>
                  ) : status === "sent" ? (
                    "Wysłano prośbę"
                  ) : (
                    <span className="flex items-center gap-2">
                      <Clock className="w-5 h-5" /> Sprawdź, czy ktoś ma wtedy czas!
                    </span>
                  )}
                </button>

                <AnimatePresence mode="wait">
                  {status === "unavailable" && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-3 text-red-600 dark:text-red-400 font-medium px-4 py-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50"
                    >
                      <AlertTriangle className="w-6 h-6 shrink-0" />
                      <div>
                        Niestety, cała kadra ma w tym czasie inne zajęcia (lub urlop). Spróbuj innej godziny klikając w inne miejsce!
                        <span className="text-xs text-red-400 dark:text-red-500/50 block w-full mt-1">Hint testowy: Spróbuj we wtorek 16:00 (sztywno zajęte) vs np. Środa.</span>
                      </div>
                    </motion.div>
                  )}

                  {status === "available" && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                      className="flex flex-col gap-4 bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800/50 w-full"
                    >
                      <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400 font-bold">
                        <CheckCircle2 className="w-6 h-6" />
                        Znaleźliśmy wolnych lektorów na ten termin!
                      </div>
                      <button
                        onClick={submitRequest}
                        className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" /> Wyślij prośbę do akceptacji
                      </button>
                    </motion.div>
                  )}

                  {status === "sent" && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400 font-medium px-5 py-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl"
                    >
                      <CheckCircle2 className="w-6 h-6 shrink-0" />
                      Sukces! Szkoła potwierdzi ten termin i przydzieli lektora.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal - Szczegóły Lekcji i Zgłaszanie Nieobecności */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-blue-500" /> Szczegóły Zajęć
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">{selectedEvent.title.replace('[NIEOBECNY] ', '')}</p>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="text-slate-500 hover:text-slate-700 bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6 flex flex-col gap-3">
                <div className="flex items-center gap-3 text-lg font-bold text-slate-900 dark:text-white">
                  <Clock className="w-5 h-5 text-blue-500" />
                  {selectedEvent.start.toLocaleDateString('pl-PL')} ({['Ndz', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'][selectedEvent.start.getDay()]}) <br/>
                  {formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}
                </div>
              </div>

              {selectedEvent.absenceReported ? (
                <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-2xl border border-red-200 dark:border-red-800/50 text-center">
                  <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="font-bold text-red-700 dark:text-red-400">Zgłoszono nieobecność</p>
                  <p className="text-sm text-red-600 dark:text-red-500 mt-1">Dziękujemy za informację. Jeśli masz odrabianie zajęć w pakiecie, skontaktuj się ze szkołą.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Nie będziesz mógł wziąć udziału w tych zajęciach z powodu choroby lub innych planów? Zgłoś to wcześniej, aby nauczyciel mógł dostosować plan.
                  </p>
                  <button
                    onClick={reportAbsence}
                    className="w-full px-8 py-4 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="w-5 h-5" /> Zgłoś nieobecność
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
