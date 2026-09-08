"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Users, ChevronLeft, CheckCircle2, UserCheck, BookOpen, Calendar, Clock, Edit3, Trash2, X, StickyNote, FolderOpen, FileUp, Link as LinkIcon, AlertTriangle, Coffee, Palmtree, Plane, Sun, LogOut } from "lucide-react";
import { SchoolCalendar } from "@/components/SchoolCalendar";
import { Views } from "react-big-calendar";
import { motion, AnimatePresence } from "framer-motion";
import { mockGroups, mockStudents, mockTeachers, mockSchedules, defaultCalendarEvents } from "@/lib/mockData";
import { usePersistentState } from "@/hooks/usePersistentState";
import { signOut } from "next-auth/react";

export default function TeacherDashboard() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const [activeTab, setActiveTab] = useState<"grafik" | "materialy" | "urlopy" | "uczniowie">("grafik");
  const [students, setStudents] = usePersistentState('app-students', mockStudents);
  const [groups, setGroups] = usePersistentState('app-groups', mockGroups);
  const [globalAttendance, setGlobalAttendance] = usePersistentState<Record<string, Record<string, boolean>>>('app-attendance', {});
  const [notifications, setNotifications] = usePersistentState<any[]>('app-notifications', []);
  
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState("");
  
  const currentTeacherId = "t1";
  const teacherData = mockTeachers.find(t => t.id === currentTeacherId);
  const [schedules, setSchedules] = usePersistentState('app-schedules', mockSchedules);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const highlightId = searchParams.get('highlightEventId');
    if (highlightId) {
      setActiveTab("grafik");
      setHighlightedEventId(highlightId);
      // Clean up URL without reloading
      window.history.replaceState({}, '', '/teacher');
    }
  }, []);
  const holidays = schedules.filter((s: any) => s.teacherId === currentTeacherId && s.type === "Holiday");
  const [newHolidayStart, setNewHolidayStart] = useState<string>("");
  const [newHolidayEnd, setNewHolidayEnd] = useState<string>("");

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

  const teacherHolidaysList = holidays.filter(h => h.status === 'approved');
  const usedVacationDays = teacherHolidaysList.reduce((acc, h: any) => acc + calculateDays(h.startDate || h.date, h.endDate || h.date), 0);
  const vacationBalance = teacherData?.vacationBalance || 0;
  const remainingVacationDays = vacationBalance - usedVacationDays;
  const requestedDays = calculateDays(newHolidayStart, newHolidayEnd);

  const requestHoliday = () => {
    if (!newHolidayStart || !newHolidayEnd || new Date(newHolidayEnd) < new Date(newHolidayStart)) return;
    setSchedules([...schedules, {
      id: "h" + Date.now(),
      teacherId: currentTeacherId,
      startDate: newHolidayStart,
      endDate: newHolidayEnd,
      type: "Holiday",
      status: "pending",
      startHour: 0,
      endHour: 24
    } as any]);
    setNewHolidayStart("");
    setNewHolidayEnd("");
  };
  
  // Stany dla notatek i obecności w ramach otwartego modala lekcji
  const [attendanceSaved, setAttendanceSaved] = useState(false);
  const [presentStudents, setPresentStudents] = useState<string[]>([]);
  const [studentNotes, setStudentNotes] = useState<Record<string, string>>({});
  
  const [lessonNoteType, setLessonNoteType] = useState<"admin" | "parents">("admin");
  const [adminNote, setAdminNote] = useState("");
  const [parentsNote, setParentsNote] = useState("");
  
  const [lessonTopic, setLessonTopic] = useState("");
  const [activeNoteStudent, setActiveNoteStudent] = useState<string | null>(null);

  const [allEvents, setAllEvents] = usePersistentState('app-calendar-events', defaultCalendarEvents);
  
  const teacherHolidays = schedules
    .filter((s: any) => s.type === "Holiday" && s.status === "approved" && s.teacherId === currentTeacherId)
    .map((s: any) => ({
      id: s.id,
      title: 'Twój Urlop',
      start: new Date(`${s.startDate}T00:00:00`),
      end: new Date(`${s.endDate}T23:59:59`),
      teacherId: s.teacherId,
      group: "Urlop",
      color: "#10b981", // Emerald
      isHoliday: true
    }));

  const teacherEvents = [
    ...allEvents
      .filter((e: any) => e.teacherId === currentTeacherId)
      .map((e: any) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end)
      })),
    ...teacherHolidays
  ];

  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Funkcja mapująca id grupy z eventu na listę jej uczniów
  const getEventGroupStudents = (groupId: string) => {
    const group = mockGroups.find(g => g.id === groupId);
    if (!group) return [];
    return group.studentIds.map(sId => {
      const student = students.find(s => s.id === sId);
      return { id: sId, name: student ? student.name : "Nieznany uczeń" };
    });
  };

  const selectedGroupStudents = selectedEvent ? getEventGroupStudents(selectedEvent.groupId) : [];

  const toggleStudent = (id: string) => {
    if (presentStudents.includes(id)) {
      setPresentStudents(presentStudents.filter(s => s !== id));
    } else {
      setPresentStudents([...presentStudents, id]);
    }
  };

  // Zmienne dla materiałów
  const [materials, setMaterials] = useState([
    { id: 1, title: 'Lista Słówek - Podróże', type: 'link', date: '10.12.2023', group: 'Angielski B1' },
    { id: 2, title: 'Czasy Przeszłe - Ćwiczenia.pdf', type: 'file', date: '08.12.2023', group: 'Angielski C1' },
  ]);

  const reportAbsence = () => {
    if (selectedEvent) {
      setAllEvents(allEvents.map((e: any) => e.id === selectedEvent.id ? { ...e, reported: true } : e));
      setSelectedEvent({ ...selectedEvent, reported: true });
      
      const eventDateStr = new Date(selectedEvent.start).toISOString().split('T')[0];
      const newNotification = {
        id: Date.now(),
        type: 'alert',
        title: 'Prośba o zastępstwo',
        description: `${teacherData?.name || "Nauczyciel"} prosi o zastępstwo w dniu ${new Date(selectedEvent.start).toLocaleDateString()} (${selectedEvent.group}, ${formatTime(new Date(selectedEvent.start))}).`,
        date: 'Przed chwilą',
        actionLink: `/admin/calendar?teacher=${encodeURIComponent(teacherData?.name || '')}&highlightEventId=${selectedEvent.id}&date=${eventDateStr}`,
        teacherId: currentTeacherId
      };
      
      const currentNotifications = Array.isArray(notifications) ? notifications : [];
      setNotifications([newNotification, ...currentNotifications]);
      
      alert("Zgłoszono prośbę o zastępstwo. Administracja otrzymała powiadomienie.");
    }
  };

  const undoReportAbsence = () => {
    if (selectedEvent) {
      setAllEvents(allEvents.map((e: any) => e.id === selectedEvent.id ? { ...e, reported: false } : e));
      setSelectedEvent({ ...selectedEvent, reported: false });
      
      const currentNotifications = Array.isArray(notifications) ? notifications : [];
      setNotifications(currentNotifications.filter((n: any) => !(n.type === 'alert' && n.actionLink?.includes(`highlightEventId=${selectedEvent.id}`))));
      
      alert("Prośba o zastępstwo została wycofana.");
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  };

  // Reset stanu po zamknięciu lub zmianie modalu
  const handleOpenEvent = (event: any) => {
    setSelectedEvent(event);
    
    // Wczytaj obecność, jeśli była zapisana
    const dateKey = event.start.toISOString().split('T')[0];
    const groupStudents = getEventGroupStudents(event.groupId);
    const presentIds: string[] = [];
    let hasAnyAttendance = false;
    
    groupStudents.forEach(student => {
      if (globalAttendance[student.id] && globalAttendance[student.id][dateKey] !== undefined) {
        hasAnyAttendance = true;
        if (globalAttendance[student.id][dateKey] === true) {
          presentIds.push(student.id);
        }
      }
    });

    setPresentStudents(presentIds);
    setAttendanceSaved(false); // Pozwala na dalszą edycję mimo wczytania
    setStudentNotes(event.studentNotes || {});
    setAdminNote(event.adminNote || "");
    setParentsNote(event.parentsNote || "");
    setLessonNoteType("admin");
    setLessonTopic(event.topic || "");
    setActiveNoteStudent(null);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-20">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ChevronLeft className="w-8 h-8" />
            </Link>
            <div>
              <h1 className="font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">Panel Nauczyciela</h1>
              <p className="text-base text-slate-500 dark:text-slate-400 mt-1">Anna Kowalska</p>
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
        <div className="flex flex-col sm:flex-row gap-4 mb-10 max-w-3xl mx-auto">
          <button 
            onClick={() => setActiveTab("grafik")}
            className={`flex-1 p-5 rounded-2xl flex items-center justify-center gap-3 text-xl font-bold transition-all border-2 ${
            activeTab === "grafik" 
              ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20" 
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800"
          }`}>
            <Calendar className="w-6 h-6" /> Mój Grafik
          </button>

          <button 
            onClick={() => setActiveTab("materialy")}
            className={`flex-1 p-5 rounded-2xl flex items-center justify-center gap-3 text-xl font-bold transition-all border-2 ${
            activeTab === "materialy" 
              ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20" 
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800"
          }`}>
            <FolderOpen className="w-6 h-6" /> Materiały
          </button>

          <button 
            onClick={() => setActiveTab("urlopy")}
            className={`flex-1 p-5 rounded-2xl flex items-center justify-center gap-3 text-xl font-bold transition-all border-2 ${
            activeTab === "urlopy" 
              ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20" 
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800"
          }`}>
            <Coffee className="w-6 h-6" /> Urlopy
          </button>

          <button 
            onClick={() => setActiveTab("uczniowie")}
            className={`flex-1 p-5 rounded-2xl flex items-center justify-center gap-3 text-xl font-bold transition-all border-2 ${
            activeTab === "uczniowie" 
              ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20" 
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800"
          }`}>
            <UserCheck className="w-6 h-6" /> Moi Uczniowie
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "grafik" && (
            <motion.div 
              key="grafik"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-emerald-500" /> Twój Grafik
                  </h2>
                </div>
                
                <div className="calendar-container">
                  <SchoolCalendar 
                    events={teacherEvents.map(e => ({
                      ...e,
                      color: e.reported ? '#f59e0b' : (e.id === highlightedEventId || e.id === Number(highlightedEventId)) ? '#ef4444' : e.color 
                    }))} 
                    defaultView={Views.WEEK} 
                    selectable={true}
                    highlightEventId={highlightedEventId || undefined}
                    onSelectEvent={(event) => {
                      if (!event.isHoliday) handleOpenEvent(event);
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "materialy" && (
            <motion.div 
              key="materialy"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-2">
                      <FolderOpen className="w-7 h-7 text-emerald-500" /> Repozytorium Materiałów
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">Udostępniaj pliki i linki uczniom</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold transition-colors">
                      <LinkIcon className="w-5 h-5" /> Dodaj Link
                    </button>
                    <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-600/20">
                      <FileUp className="w-5 h-5" /> Wgraj Plik
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {materials.map(mat => (
                    <div key={mat.id} className="p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors flex items-start gap-4 bg-slate-50 dark:bg-slate-800/30 group">
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl flex items-center justify-center shrink-0">
                        {mat.type === 'link' ? <LinkIcon className="w-6 h-6 text-blue-500" /> : <BookOpen className="w-6 h-6 text-amber-500" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{mat.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Dla grupy: <span className="font-bold text-slate-700 dark:text-slate-300">{mat.group}</span></p>
                        <p className="text-xs text-slate-400 mt-2">Dodano: {mat.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "urlopy" && (
            <motion.div 
              key="urlopy"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Coffee className="w-8 h-8 text-emerald-500" /> Moje Urlopy
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Rodzaj Umowy</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{teacherData?.contractType || "Brak danych"}</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/50">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Dostępne dni</p>
                    <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{remainingVacationDays} <span className="text-sm font-medium">/ {vacationBalance}</span></p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-900/50">
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Wykorzystane dni</p>
                    <p className="text-2xl font-black text-blue-700 dark:text-blue-300">{usedVacationDays}</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-1/3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Zgłoś wniosek urlopowy</h3>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800 shadow-sm relative overflow-hidden">
                      <Palmtree className="absolute -bottom-4 -right-4 w-24 h-24 text-emerald-500/10 dark:text-emerald-400/10 pointer-events-none" />
                      
                      <div className="flex flex-col gap-4 mb-6 relative z-10">
                        <div>
                          <label className="block text-sm font-bold text-emerald-900 dark:text-emerald-100 mb-2">Początek urlopu</label>
                          <input 
                            type="date"
                            value={newHolidayStart}
                            onChange={e => setNewHolidayStart(e.target.value)}
                            className="w-full p-3 rounded-xl border-2 border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-emerald-900 dark:text-emerald-100 mb-2">Koniec urlopu</label>
                          <input 
                            type="date"
                            value={newHolidayEnd}
                            onChange={e => setNewHolidayEnd(e.target.value)}
                            min={newHolidayStart}
                            className="w-full p-3 rounded-xl border-2 border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
                          />
                        </div>
                      </div>
                      
                      {requestedDays > 0 && (
                        <div className="mb-4 text-sm font-bold text-emerald-800 dark:text-emerald-200 bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800">
                          Wybrano dni: <span className="text-emerald-600 dark:text-emerald-400">{requestedDays}</span>
                        </div>
                      )}

                      <button 
                        onClick={requestHoliday}
                        disabled={!newHolidayStart || !newHolidayEnd || (remainingVacationDays - requestedDays < 0 && teacherData?.contractType === "UoP")}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:dark:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold p-4 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex justify-center items-center gap-2 relative z-10"
                      >
                        <Plane className="w-5 h-5" /> Wyślij wniosek
                      </button>
                      
                      {(remainingVacationDays - requestedDays < 0 && teacherData?.contractType === "UoP") && (
                        <p className="text-xs text-red-500 font-bold mt-3 text-center">Brak wystarczającej liczby dni urlopowych.</p>
                      )}
                    </div>
                  </div>

                  <div className="w-full md:w-2/3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Historia wniosków</h3>
                    <div className="space-y-3">
                      {holidays.length === 0 ? (
                        <p className="text-slate-500 italic p-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">Nie zgłaszałeś jeszcze żadnych urlopów.</p>
                      ) : (
                        holidays.map(h => (
                          <div key={h.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                              <Calendar className="w-5 h-5 text-slate-400" />
                              <span className="font-bold text-slate-900 dark:text-white flex flex-col sm:flex-row sm:gap-2">
                                <span>{h.startDate ? new Date(h.startDate).toLocaleDateString('pl-PL') : (h as any).date ? new Date((h as any).date).toLocaleDateString('pl-PL') : ""}</span>
                                {(h.endDate && h.endDate !== h.startDate) && (
                                  <>
                                    <span className="hidden sm:inline text-slate-400">-</span>
                                    <span>{new Date(h.endDate).toLocaleDateString('pl-PL')}</span>
                                  </>
                                )}
                              </span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              h.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                              h.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                              'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                            }`}>
                              {h.status === 'approved' ? 'Zaakceptowany' : h.status === 'rejected' ? 'Odrzucony' : 'Oczekujący'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {activeTab === "uczniowie" && (
            <motion.div 
              key="uczniowie"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <UserCheck className="w-8 h-8 text-emerald-500" /> Moi Uczniowie
                  </h2>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Indywidualni Uczniowie</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {students.filter(s => s.assignedTeachers?.includes(currentTeacherId)).map(student => (
                        <div key={student.id} className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{student.name}</h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400">Poziom: {student.level} • Telefon: {student.phone}</p>
                            </div>
                            <Link href={`/admin/students/${student.id}`} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors">
                              <UserCheck className="w-5 h-5" />
                            </Link>
                          </div>
                          
                          <div className="space-y-3 mt-auto pt-4">
                            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider">Globalne Notatki</h4>
                            {(!student.globalNotes || student.globalNotes.length === 0) ? (
                              <p className="text-sm text-slate-500 italic">Brak notatek o tym uczniu.</p>
                            ) : (
                              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                {student.globalNotes.map((note: any) => (
                                  <div key={note.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm group/note">
                                    <div className="flex justify-between mb-1">
                                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{note.authorName}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-slate-400 text-xs">{note.date}</span>
                                        {note.authorId === currentTeacherId && (
                                          <div className="flex items-center gap-1 opacity-0 group-hover/note:opacity-100 transition-opacity">
                                            <button 
                                              onClick={() => {
                                                setEditingNoteId(note.id);
                                                setEditNoteText(note.text);
                                              }}
                                              className="text-slate-400 hover:text-emerald-500 p-1"
                                            >
                                              <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                              onClick={() => {
                                                if (confirm("Usunąć tę notatkę?")) {
                                                  setStudents(students.map((s: any) => s.id === student.id ? { ...s, globalNotes: s.globalNotes.filter((n: any) => n.id !== note.id) } : s));
                                                }
                                              }}
                                              className="text-slate-400 hover:text-red-500 p-1"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {editingNoteId === note.id ? (
                                      <div className="mt-2">
                                        <textarea 
                                          value={editNoteText}
                                          onChange={e => setEditNoteText(e.target.value)}
                                          className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                                          rows={2}
                                        />
                                        <div className="flex gap-2 mt-2">
                                          <button 
                                            onClick={() => {
                                              setStudents(students.map((s: any) => {
                                                if (s.id === student.id) {
                                                  return {
                                                    ...s,
                                                    globalNotes: s.globalNotes.map((n: any) => n.id === note.id ? { ...n, text: editNoteText } : n)
                                                  };
                                                }
                                                return s;
                                              }));
                                              setEditingNoteId(null);
                                            }}
                                            className="px-3 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 rounded text-xs font-bold"
                                          >
                                            Zapisz
                                          </button>
                                          <button 
                                            onClick={() => setEditingNoteId(null)}
                                            className="px-3 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 rounded text-xs font-bold"
                                          >
                                            Anuluj
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-slate-700 dark:text-slate-300">{note.text}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                              <div className="flex gap-2">
                                <textarea 
                                  id={`note-${student.id}`}
                                  placeholder="Nowa notatka..."
                                  rows={2}
                                  className="flex-1 p-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 text-sm"
                                />
                              </div>
                              <div className="flex justify-between items-center gap-2">
                                <select 
                                  id={`note-type-${student.id}`}
                                  className="p-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm focus:outline-none"
                                >
                                  <option value="admin">Dla szkoły (wewnętrzna)</option>
                                  <option value="parents">Dla rodziców (widoczna w panelu)</option>
                                </select>
                                <button 
                                  onClick={() => {
                                    const input = document.getElementById(`note-${student.id}`) as HTMLTextAreaElement;
                                    const select = document.getElementById(`note-type-${student.id}`) as HTMLSelectElement;
                                    if (!input.value.trim()) return;
                                    setStudents(students.map((s: any) => {
                                      if (s.id === student.id) {
                                        return {
                                          ...s,
                                          globalNotes: [...(s.globalNotes || []), {
                                            id: "n" + Date.now(),
                                            authorId: currentTeacherId,
                                            authorName: teacherData?.name || "Nauczyciel",
                                            text: input.value,
                                            type: select.value,
                                            date: new Date().toLocaleDateString('pl-PL')
                                          }]
                                        };
                                      }
                                      return s;
                                    }));
                                    input.value = "";
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
                                >
                                  Dodaj
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {students.filter(s => s.assignedTeachers?.includes(currentTeacherId)).length === 0 && (
                        <p className="text-slate-500 col-span-2">Nie masz przypisanych żadnych uczniów indywidualnych.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Przypisane Grupy</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {groups.filter((g: any) => g.assignedTeachers?.includes(currentTeacherId)).map((group: any) => (
                        <div key={group.id} className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{group.name}</h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400">Typ: {group.type} • Poziom: {group.level}</p>
                            </div>
                            <Link href={`/admin/groups?group=${encodeURIComponent(group.name)}`} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors">
                              <Users className="w-5 h-5" />
                            </Link>
                          </div>
                          
                          <div className="space-y-3 mt-auto pt-4">
                            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider">Globalne Notatki Grupy</h4>
                            {(!group.globalNotes || group.globalNotes.length === 0) ? (
                              <p className="text-sm text-slate-500 italic">Brak notatek o tej grupie.</p>
                            ) : (
                              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                {group.globalNotes.map((note: any) => (
                                  <div key={note.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm group/note">
                                    <div className="flex justify-between mb-1">
                                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{note.authorName}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-slate-400 text-xs">{note.date}</span>
                                        {note.authorId === currentTeacherId && (
                                          <div className="flex items-center gap-1 opacity-0 group-hover/note:opacity-100 transition-opacity">
                                            <button 
                                              onClick={() => {
                                                setEditingNoteId(note.id);
                                                setEditNoteText(note.text);
                                              }}
                                              className="text-slate-400 hover:text-emerald-500 p-1"
                                            >
                                              <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                              onClick={() => {
                                                if (confirm("Usunąć tę notatkę?")) {
                                                  setGroups(groups.map((g: any) => g.id === group.id ? { ...g, globalNotes: g.globalNotes.filter((n: any) => n.id !== note.id) } : g));
                                                }
                                              }}
                                              className="text-slate-400 hover:text-red-500 p-1"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {editingNoteId === note.id ? (
                                      <div className="mt-2">
                                        <textarea 
                                          value={editNoteText}
                                          onChange={e => setEditNoteText(e.target.value)}
                                          className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                                          rows={2}
                                        />
                                        <div className="flex gap-2 mt-2">
                                          <button 
                                            onClick={() => {
                                              setGroups(groups.map((g: any) => {
                                                if (g.id === group.id) {
                                                  return {
                                                    ...g,
                                                    globalNotes: g.globalNotes.map((n: any) => n.id === note.id ? { ...n, text: editNoteText } : n)
                                                  };
                                                }
                                                return g;
                                              }));
                                              setEditingNoteId(null);
                                            }}
                                            className="px-3 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 rounded text-xs font-bold"
                                          >
                                            Zapisz
                                          </button>
                                          <button 
                                            onClick={() => setEditingNoteId(null)}
                                            className="px-3 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 rounded text-xs font-bold"
                                          >
                                            Anuluj
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-slate-700 dark:text-slate-300">{note.text}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                              <div className="flex gap-2">
                                <textarea 
                                  id={`group-note-${group.id}`}
                                  placeholder="Nowa notatka..."
                                  rows={2}
                                  className="flex-1 p-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 text-sm"
                                />
                              </div>
                              <div className="flex justify-between items-center gap-2">
                                <select 
                                  id={`group-note-type-${group.id}`}
                                  className="p-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm focus:outline-none"
                                >
                                  <option value="admin">Dla szkoły (wewnętrzna)</option>
                                  <option value="parents">Dla rodziców (widoczna w panelu)</option>
                                </select>
                                <button 
                                  onClick={() => {
                                    const input = document.getElementById(`group-note-${group.id}`) as HTMLTextAreaElement;
                                    const select = document.getElementById(`group-note-type-${group.id}`) as HTMLSelectElement;
                                    if (!input.value.trim()) return;
                                    setGroups(groups.map((g: any) => {
                                      if (g.id === group.id) {
                                        return {
                                          ...g,
                                          globalNotes: [...(g.globalNotes || []), {
                                            id: "gn" + Date.now(),
                                            authorId: currentTeacherId,
                                            authorName: teacherData?.name || "Nauczyciel",
                                            text: input.value,
                                            type: select.value,
                                            date: new Date().toLocaleDateString('pl-PL')
                                          }]
                                        };
                                      }
                                      return g;
                                    }));
                                    input.value = "";
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
                                >
                                  Dodaj
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {groups.filter((g: any) => g.assignedTeachers?.includes(currentTeacherId)).length === 0 && (
                        <p className="text-slate-500 col-span-2">Nie masz przypisanych żadnych grup.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal ze szczegółami wydarzenia w grafiku - Lesson Dashboard */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white dark:bg-slate-900 p-0 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-emerald-500" /> Dziennik Lekcyjny: {selectedEvent.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-slate-600 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {selectedEvent.start.toLocaleDateString('pl-PL')}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}</span>
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> Sala: {selectedEvent.room}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full text-slate-600 dark:text-slate-300 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Modal Body - Scrollable */}
              <div className="p-6 overflow-y-auto">
                {!attendanceSaved ? (
                  <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Lewa kolumna - Uczniowie i frekwencja */}
                    <div className="flex-1 space-y-4">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                        <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> 
                        Obecność i Notatki o Uczniach
                      </h4>
                      
                      {selectedGroupStudents.length === 0 ? (
                        <p className="text-center text-slate-500 p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                          Brak uczniów przypisanych do tej grupy.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {selectedGroupStudents.map(student => (
                            <div key={student.id} className="flex flex-col gap-2">
                              <div 
                                className={`p-3 rounded-xl border-2 transition-all flex justify-between items-center gap-3 ${
                                  presentStudents.includes(student.id)
                                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-900 dark:text-emerald-100"
                                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300"
                                }`}
                              >
                                <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleStudent(student.id)}>
                                  <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 shrink-0 transition-colors ${
                                    presentStudents.includes(student.id) ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 dark:border-slate-600"
                                  }`}>
                                    {presentStudents.includes(student.id) && <CheckCircle2 className="w-4 h-4" />}
                                  </div>
                                  <span className="font-bold">{student.name}</span>
                                </div>
                                
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setActiveNoteStudent(activeNoteStudent === student.id ? null : student.id); }}
                                  className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors shrink-0 ${
                                    studentNotes[student.id] || activeNoteStudent === student.id
                                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400" 
                                      : "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                  }`}
                                  title={studentNotes[student.id] ? "Edytuj notatkę" : "Dodaj notatkę o uczniu"}
                                >
                                  <Edit3 className="w-4 h-4" /> 
                                </button>
                              </div>
                              
                              <AnimatePresence>
                                {activeNoteStudent === student.id && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="ml-0 sm:ml-9 overflow-hidden"
                                  >
                                    <textarea 
                                      value={studentNotes[student.id] || ""}
                                      onChange={(e) => setStudentNotes({...studentNotes, [student.id]: e.target.value})}
                                      placeholder={`Notatka o uczniu ${student.name} na tej konkretnej lekcji...`}
                                      className="w-full p-3 mt-1 rounded-xl border-2 border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 min-h-[80px] text-sm"
                                    />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Prawa kolumna - Notatki z lekcji */}
                    <div className="flex-1 space-y-6">
                      <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                          <StickyNote className="w-5 h-5 text-blue-500" /> Przebieg Lekcji
                        </h4>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">Temat zajęć</label>
                            <input 
                              type="text" 
                              value={lessonTopic}
                              onChange={(e) => setLessonTopic(e.target.value)}
                              placeholder="Wpisz krótki temat..."
                              className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                          </div>
                          
                          <div>
                            <div className="flex items-center bg-slate-200/50 dark:bg-slate-800 rounded-xl p-1 mb-4 w-full md:w-max">
                              <button 
                                onClick={() => setLessonNoteType("admin")}
                                className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                  lessonNoteType === "admin" 
                                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                }`}
                              >
                                Dla Administracji
                              </button>
                              <button 
                                onClick={() => setLessonNoteType("parents")}
                                className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                  lessonNoteType === "parents" 
                                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                }`}
                              >
                                Dla Rodziców
                              </button>
                            </div>
                            
                            {lessonNoteType === "admin" ? (
                              <textarea 
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="Wpisz notatkę przeznaczoną tylko do wiadomości szkoły/administracji..."
                                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors min-h-[140px]"
                              />
                            ) : (
                              <textarea 
                                value={parentsNote}
                                onChange={(e) => setParentsNote(e.target.value)}
                                placeholder="Wpisz notatkę, która będzie widoczna w panelu klienta dla rodziców/ucznia..."
                                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors min-h-[140px]"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        {selectedEvent.reported ? (
                          <button 
                            onClick={undoReportAbsence}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-bold transition-colors border-2 border-slate-200 dark:border-slate-700 hover:border-red-200"
                          >
                            <X className="w-4 h-4" /> Odwołaj zastępstwo
                          </button>
                        ) : (
                          <button 
                            onClick={reportAbsence}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl font-bold transition-colors border-2 border-amber-200 dark:border-amber-800/50"
                          >
                            <AlertTriangle className="w-4 h-4" /> Zgłoś zastępstwo
                          </button>
                        )}
                        
                        <button 
                          onClick={() => {
                            setAttendanceSaved(true);
                            setAllEvents(allEvents.map((e: any) => {
                              if (e.id === selectedEvent.id) {
                                return { ...e, adminNote, parentsNote, topic: lessonTopic, studentNotes };
                              }
                              return e;
                            }));
                            // Save attendance globally
                            if (selectedEvent) {
                              const dateKey = selectedEvent.start.toISOString().split('T')[0];
                              const newGlobalAttendance = { ...globalAttendance };
                              
                              selectedGroupStudents.forEach(student => {
                                if (!newGlobalAttendance[student.id]) {
                                  newGlobalAttendance[student.id] = {};
                                }
                                newGlobalAttendance[student.id][dateKey] = presentStudents.includes(student.id);
                              });
                              
                              setGlobalAttendance(newGlobalAttendance);
                            }
                          }}
                          className="flex-1 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all"
                        >
                          Zapisz Dziennik
                        </button>
                      </div>
                    </div>

                  </div>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-12 flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Dziennik został uzupełniony!</h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8">Obecność, temat i notatki z lekcji zostały zapisane w bazie szkoły.</p>
                    
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setAttendanceSaved(false)}
                        className="px-6 py-2 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        Wróć do edycji
                      </button>
                      <button 
                        onClick={() => setSelectedEvent(null)}
                        className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl transition-colors"
                      >
                        Zamknij kalendarz
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
