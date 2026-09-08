"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChevronLeft, Calendar as CalendarIcon, Filter, Plus, X, Trash2, Edit3, FileText, User, BookOpen, Clock } from "lucide-react";
import { SchoolCalendar } from "@/components/SchoolCalendar";
import { Views } from "react-big-calendar";
import { motion, AnimatePresence } from "framer-motion";
import { mockGroups, mockTeachers, mockRooms, defaultCalendarEvents, mockSchedules, mockStudents } from "@/lib/mockData";
import { usePersistentState } from "@/hooks/usePersistentState";
import { UserCheck, CheckCircle2, AlertTriangle } from "lucide-react";

export default function AdminCalendarPage() {
  const [filterType, setFilterType] = useState("wszystkie"); // wszystkie, nauczyciel, grupa, uczen
  const [filterValue, setFilterValue] = useState("");
  const [defaultDate, setDefaultDate] = useState<Date | undefined>(undefined);
  const [highlightEventId, setHighlightEventId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const teacher = params.get("teacher");
    const dateStr = params.get("date");
    const highlight = params.get("highlightEventId");
    
    if (teacher) {
      setFilterType("nauczyciel");
      setFilterValue(teacher);
    }
    if (dateStr) {
      setDefaultDate(new Date(dateStr));
    }
    if (highlight) {
      setHighlightEventId(highlight);
    }
  }, []);

  const now = new Date();
  const [events, setEvents] = usePersistentState('app-calendar-events', defaultCalendarEvents);
  const [schedules] = usePersistentState('app-schedules', mockSchedules);
  const [teachersList] = usePersistentState('app-teachers', mockTeachers);
  const [globalAttendance, setGlobalAttendance] = usePersistentState<Record<string, Record<string, boolean>>>('app-attendance', {});
  const [notifications, setNotifications] = usePersistentState('app-notifications', []);

  const getEventGroupStudents = (groupId: string) => {
    const group = mockGroups.find(g => g.id === groupId);
    if (!group) return [];
    return group.studentIds.map(sId => {
      const student = mockStudents.find(s => s.id === sId);
      return { id: sId, name: student ? student.name : "Nieznany uczeń" };
    });
  };

  const holidays = schedules
    .filter((s: any) => s.type === "Holiday" && s.status === "approved")
    .map((s: any) => {
      const teacherName = teachersList.find((t: any) => t.id === s.teacherId)?.name || "Nauczyciel";
      return {
        id: s.id,
        title: `Urlop (${teacherName})`,
        start: new Date(`${s.startDate}T00:00:00`),
        end: new Date(`${s.endDate}T23:59:59`),
        teacher: teacherName,
        teacherId: s.teacherId,
        group: "Urlop",
        color: "#10b981",
        isHoliday: true
      };
    });

  const parsedEvents = [
    ...events.map((e: any) => ({
      ...e,
      start: new Date(e.start),
      end: new Date(e.end)
    })),
    ...holidays
  ];

  // W trybie "Connected", Grupy i Nauczyciele to zasoby z zewnątrz
  const groups = mockGroups.map(g => g.name);
  const teachers = mockTeachers.map(t => t.name);
  const students = ["Tomasz Kowalski", "Anna Nowak", "Kamil Wiśniewski"]; 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create">("view");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  const selectedGroupStudents = selectedEvent?.groupId ? getEventGroupStudents(selectedEvent.groupId) : [];
  const dateKey = selectedEvent ? new Date(selectedEvent.start).toISOString().split('T')[0] : '';
  
  // Form state
  const [formData, setFormData] = useState({
    group: "",
    teacher: "",
    start: new Date(),
    end: new Date(),
    topic: "",
    adminNote: "",
    parentsNote: ""
  });

  const filteredEvents = parsedEvents.filter((e: any) => {
    if (filterType === "wszystkie") return true;
    if (filterType === "nauczyciel" && filterValue) return e.teacher === filterValue;
    if (filterType === "grupa" && filterValue) return e.group === filterValue;
    if (filterType === "uczen" && filterValue) return true; // Dla uproszczenia w demo
    return true;
  });

  const handleFilterTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
    setFilterValue(""); 
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedEvent(null);
    setModalMode("create");
    setFormData({
      group: groups[0],
      teacher: teachers[0],
      start,
      end,
      topic: "",
      adminNote: "",
      parentsNote: ""
    });
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    setModalMode("view");
    setFormData({
      group: event.group,
      teacher: event.teacher,
      start: event.start,
      end: event.end,
      topic: event.topic || "",
      adminNote: event.adminNote || "",
      parentsNote: event.parentsNote || ""
    });
    setIsModalOpen(true);
  };

  const saveEvent = () => {
    const title = `${formData.group} (${formData.teacher.split(' ')[0][0]}. ${formData.teacher.split(' ')[1]})`;
    
    if (modalMode === "edit" && selectedEvent) {
      setEvents(events.map((e: any) => e.id === selectedEvent.id ? { ...e, title, ...formData, start: formData.start.toISOString(), end: formData.end.toISOString() } : e));
    } else if (modalMode === "create") {
      const teacherId = mockTeachers.find(t => t.name === formData.teacher)?.id || "t1";
      const groupId = mockGroups.find(g => g.name === formData.group)?.id || "g1";
      setEvents([...events, { id: Date.now(), title, studentNotes: {}, teacherId, groupId, room: "Sala 1", reported: false, ...formData, start: formData.start.toISOString(), end: formData.end.toISOString() }]);
    }
    setIsModalOpen(false);
  };

  const deleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter((e: any) => e.id !== selectedEvent.id));
      setIsModalOpen(false);
    }
  };

  // Helper to format datetime-local input
  const formatForInput = (date: Date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  };
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pl-PL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-20">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ChevronLeft className="w-8 h-8" />
            </Link>
            <div>
              <h1 className="font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">Grafik Zajęć</h1>
              <p className="text-base text-slate-500 dark:text-slate-400 mt-1">Interaktywny kalendarz szkoły</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 sm:mt-12 space-y-8">
        
        {/* Filtry zaawansowane */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
              <Filter className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Wyszukiwanie</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Filtruj kalendarz</p>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
            <select 
              value={filterType}
              onChange={handleFilterTypeChange}
              className="w-full sm:w-64 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 text-lg font-medium"
            >
              <option value="wszystkie">Wszystkie zajęcia</option>
              <option value="nauczyciel">Pokaż wg Nauczyciela</option>
              <option value="grupa">Pokaż wg Grupy</option>
              <option value="uczen">Pokaż wg Ucznia</option>
            </select>

            {filterType === "nauczyciel" && (
              <select 
                value={filterValue}
                onChange={e => setFilterValue(e.target.value)}
                className="w-full sm:w-64 p-4 rounded-xl border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 focus:outline-none focus:border-blue-500 text-lg font-medium animate-in fade-in"
              >
                <option value="" disabled>Wybierz nauczyciela...</option>
                {teachers.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            )}

            {filterType === "grupa" && (
              <select 
                value={filterValue}
                onChange={e => setFilterValue(e.target.value)}
                className="w-full sm:w-64 p-4 rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 focus:outline-none focus:border-emerald-500 text-lg font-medium animate-in fade-in"
              >
                <option value="" disabled>Wybierz grupę...</option>
                {groups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            )}

            {filterType === "uczen" && (
              <select 
                value={filterValue}
                onChange={e => setFilterValue(e.target.value)}
                className="w-full sm:w-64 p-4 rounded-xl border-2 border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20 text-violet-900 dark:text-violet-100 focus:outline-none focus:border-violet-500 text-lg font-medium animate-in fade-in"
              >
                <option value="" disabled>Wybierz ucznia...</option>
                {students.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
          </div>
          
          <button 
            onClick={() => {
              setSelectedEvent(null);
              setModalMode("create");
              setFormData({ group: groups[0], teacher: teachers[0], start: new Date(), end: new Date(new Date().getTime() + 90*60000), topic: "", adminNote: "", parentsNote: "" });
              setIsModalOpen(true);
            }}
            className="shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold transition-colors shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-5 h-5" /> Dodaj zajęcia
          </button>
        </div>

        {/* Prawdziwy Kalendarz */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <SchoolCalendar 
            events={filteredEvents} 
            defaultView={Views.WEEK} 
            defaultDate={defaultDate}
            highlightEventId={highlightEventId}
            selectable={true}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            key={defaultDate ? defaultDate.toISOString() : 'default'} // Force re-render if defaultDate changes
          />
        </div>

      </main>

      {/* Modal - Widok, Edycja lub Dodawanie wydarzenia */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {modalMode === "view" && selectedEvent?.title}
                {modalMode === "edit" && "Edytuj zajęcia"}
                {modalMode === "create" && "Dodaj nowe zajęcia"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {modalMode === "view" && selectedEvent ? (
              // WIDOK SZCZEGÓŁÓW
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {selectedEvent.reported && (
                    <div className="col-span-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        <div>
                          <p className="font-bold text-red-900 dark:text-red-100">Potrzebne zastępstwo</p>
                          <p className="text-sm text-red-700 dark:text-red-300">Wybierz nowego nauczyciela z listy poniżej, aby przypisać zastępstwo.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <CalendarIcon className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">{formatDate(selectedEvent.start)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <Clock className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Czas</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <User className="w-6 h-6 text-violet-500" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nauczyciel</p>
                      <select 
                        value={selectedEvent.teacher}
                        onChange={(e) => {
                          const newTeacher = e.target.value;
                          const newTitle = `${selectedEvent.group} (${newTeacher.split(' ')[0][0]}. ${newTeacher.split(' ')[1]})`;
                          const updatedEvent = { ...selectedEvent, teacher: newTeacher, title: newTitle };
                          
                          if (selectedEvent.reported) {
                            updatedEvent.reported = false;
                            setNotifications(notifications.filter((n: any) => !(n.type === 'alert' && n.actionLink?.includes(`highlightEventId=${selectedEvent.id}`))));
                          }
                          
                          setEvents(events.map(ev => ev.id === selectedEvent.id ? updatedEvent : ev));
                          setSelectedEvent(updatedEvent);
                        }}
                        className="text-sm font-medium text-slate-900 dark:text-white bg-transparent border-none p-0 focus:ring-0 w-full cursor-pointer appearance-none hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                        title="Kliknij, aby zmienić nauczyciela"
                      >
                        {teachers.map(t => (
                          <option key={t} value={t} className="text-slate-900 dark:text-white bg-white dark:bg-slate-800">{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <BookOpen className="w-6 h-6 text-amber-500" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Grupa</p>
                      <select 
                        value={selectedEvent.group}
                        onChange={(e) => {
                          const newGroup = e.target.value;
                          const newTitle = `${newGroup} (${selectedEvent.teacher.split(' ')[0][0]}. ${selectedEvent.teacher.split(' ')[1]})`;
                          const updatedEvent = { ...selectedEvent, group: newGroup, title: newTitle };
                          setEvents(events.map(ev => ev.id === selectedEvent.id ? updatedEvent : ev));
                          setSelectedEvent(updatedEvent);
                        }}
                        className="text-sm font-medium text-slate-900 dark:text-white bg-transparent border-none p-0 focus:ring-0 w-full cursor-pointer appearance-none hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                        title="Kliknij, aby zmienić grupę"
                      >
                        {groups.map(g => (
                          <option key={g} value={g} className="text-slate-900 dark:text-white bg-white dark:bg-slate-800">{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/50">
                  <h4 className="text-sm font-bold text-amber-800 dark:text-amber-500 flex items-center gap-2 mb-3 uppercase tracking-wider">
                    <FileText className="w-4 h-4" /> Raport z lekcji
                  </h4>
                  {selectedEvent.topic || selectedEvent.adminNote || selectedEvent.parentsNote ? (
                    <div className="space-y-3">
                      {selectedEvent.topic && <p className="text-slate-900 dark:text-white"><strong className="text-slate-600 dark:text-slate-400">Temat:</strong> {selectedEvent.topic}</p>}
                      {selectedEvent.adminNote && (
                        <div>
                          <p className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-1">Dla administracji:</p>
                          <p className="text-slate-900 dark:text-white text-sm bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">{selectedEvent.adminNote}</p>
                        </div>
                      )}
                      {selectedEvent.parentsNote && (
                        <div>
                          <p className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-1">Dla rodziców:</p>
                          <p className="text-slate-900 dark:text-white text-sm bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">{selectedEvent.parentsNote}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 italic">Brak raportu z tej lekcji.</p>
                  )}
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 mt-6">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300 flex items-center gap-2 mb-3 uppercase tracking-wider">
                    <UserCheck className="w-4 h-4" /> Obecność uczniów
                  </h4>
                  {selectedGroupStudents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedGroupStudents.map(student => {
                        const isPresent = globalAttendance[student.id]?.[dateKey];
                        const isRecorded = isPresent !== undefined;
                        
                        return (
                          <div key={student.id} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                            <span className="font-medium text-slate-700 dark:text-slate-300">{student.name}</span>
                            {isRecorded ? (
                              <span className={`flex items-center gap-1 text-sm font-bold ${isPresent ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                                {isPresent ? <><CheckCircle2 className="w-4 h-4" /> Obecny</> : <><X className="w-4 h-4" /> Nieobecny</>}
                              </span>
                            ) : (
                              <span className="text-sm text-slate-400 italic">Brak wpisu</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 italic">Brak przypisanych uczniów do tej grupy.</p>
                  )}
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <button 
                    onClick={deleteEvent}
                    className="flex items-center gap-2 text-red-500 hover:text-red-700 font-bold transition-colors px-4 py-2"
                  >
                    <Trash2 className="w-5 h-5" /> Usuń
                  </button>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Zamknij
                    </button>
                    <button 
                      onClick={() => setModalMode("edit")}
                      className="flex items-center gap-2 px-5 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-xl font-bold transition-colors"
                    >
                      <Edit3 className="w-5 h-5" /> Edytuj plan
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // WIDOK EDYCJI / TWORZENIA
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Grupa</label>
                  <select 
                    value={formData.group} 
                    onChange={e => setFormData({...formData, group: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    {groups.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Nauczyciel</label>
                  <select 
                    value={formData.teacher} 
                    onChange={e => setFormData({...formData, teacher: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    {teachers.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Start</label>
                    <input 
                      type="datetime-local" 
                      value={formatForInput(formData.start)}
                      onChange={e => setFormData({...formData, start: new Date(e.target.value)})}
                      className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Koniec</label>
                    <input 
                      type="datetime-local" 
                      value={formatForInput(formData.end)}
                      onChange={e => setFormData({...formData, end: new Date(e.target.value)})}
                      className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Temat zajęć</label>
                  <input 
                    type="text"
                    value={formData.topic}
                    onChange={e => setFormData({...formData, topic: e.target.value})}
                    placeholder="Wpisz temat zajęć..."
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Notatka dla administracji</label>
                  <textarea 
                    value={formData.adminNote}
                    onChange={e => setFormData({...formData, adminNote: e.target.value})}
                    placeholder="Zastrzeżenia, prośby o materiały..."
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Notatka dla rodziców</label>
                  <textarea 
                    value={formData.parentsNote}
                    onChange={e => setFormData({...formData, parentsNote: e.target.value})}
                    placeholder="Postępy ucznia, praca domowa..."
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 min-h-[100px]"
                  />
                </div>

                <div className="mt-8 flex justify-between gap-4">
                  {modalMode === "edit" ? (
                    <button 
                      onClick={() => setModalMode("view")}
                      className="px-5 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Wróć
                    </button>
                  ) : (
                    <div />
                  )}
                  
                  <div className="flex gap-4">
                    {modalMode === "create" && (
                      <button 
                        onClick={() => setIsModalOpen(false)}
                        className="px-5 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Anuluj
                      </button>
                    )}
                    <button 
                      onClick={saveEvent}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-600/20"
                    >
                      Zapisz
                    </button>
                  </div>
                </div>
              </div>
            )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
