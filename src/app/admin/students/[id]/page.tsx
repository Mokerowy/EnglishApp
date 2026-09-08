"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChevronLeft, Layers, FileText, Save, History, DollarSign, Calendar, X, AlertTriangle, CheckCircle2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { mockStudents, mockGroups } from "@/lib/mockData";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useParams, useRouter } from "next/navigation";

export default function StudentDashboard() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  
  const [students, setStudents] = usePersistentState('app-students', mockStudents);
  const [groups, setGroups] = usePersistentState('app-groups', mockGroups);
  const [globalAttendance] = usePersistentState<Record<string, Record<string, boolean>>>('app-attendance', {});
  
  const localStudent = students.find((s: any) => s.id === studentId);
  const mockStudent = mockStudents.find((s: any) => s.id === studentId);
  const student = localStudent ? { ...mockStudent, ...localStudent, debt: localStudent.debt ?? mockStudent?.debt, paymentHistory: localStudent.paymentHistory ?? mockStudent?.paymentHistory } : mockStudent;

  
  const studentAttendance = globalAttendance[studentId] || {};
  const totalClasses = Object.keys(studentAttendance).length;
  const presentClasses = Object.values(studentAttendance).filter(Boolean).length;
  const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
  const hasAttendanceData = totalClasses > 0;

  const [editingNote, setEditingNote] = useState("");
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  
  useEffect(() => {
    if (student) {
      setEditingNote((student as any).note || "");
    }
  }, [student]);

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Nie znaleziono ucznia</h2>
          <Link href="/admin/students" className="text-violet-600 hover:underline">Wróć do listy uczniów</Link>
        </div>
      </div>
    );
  }

  const saveNote = () => {
    setStudents(students.map((s: any) => s.id === student.id ? { ...s, note: editingNote } : s));
  };

  const addGlobalNote = (noteText: string) => {
    if (!noteText.trim()) return;
    const newNote = {
      authorId: "admin",
      authorName: "Właściciel",
      text: noteText,
      date: new Date().toLocaleDateString('pl-PL')
    };
    
    setStudents(students.map((s: any) => s.id === student.id ? {
      ...s,
      globalNotes: [...(s.globalNotes || []), newNote]
    } : s));
  };

  const toggleGroup = (groupId: string) => {
    setGroups(groups.map((g: any) => {
      if (g.id === groupId) {
        const isMember = g.studentIds.includes(student.id);
        if (isMember) {
          return { ...g, studentIds: g.studentIds.filter((id: string) => id !== student.id) };
        } else {
          return { ...g, studentIds: [...g.studentIds, student.id] };
        }
      }
      return g;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-20">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ChevronLeft className="w-8 h-8" />
            </button>
            <div>
              <h1 className="font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">Profil Ucznia</h1>
              <p className="text-base text-slate-500 dark:text-slate-400 mt-1">{student.name}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 sm:mt-12 space-y-8">
        
        {/* Górne statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center font-bold text-xl">
                {student.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{student.name}</h2>
                <p className="text-slate-500 dark:text-slate-400">{(student as any).email || "Brak email"}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl flex-1 text-center border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500">Poziom</p>
                <p className="font-bold text-slate-900 dark:text-white">{student.level}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl flex-1 text-center border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500">Status</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">{student.status}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" /> Rozliczenia
            </h3>
            {student.debt && student.debt > 0 ? (
              <p className="text-red-600 dark:text-red-400 font-extrabold text-2xl mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" /> Zaległość: {student.debt} zł
              </p>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 mb-4">Brak zaległych płatności.</p>
            )}
            <div className="flex gap-2">
              <button onClick={() => setShowPaymentHistory(true)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors">
                Historia wpłat
              </button>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-chat', { detail: { userId: student.id } }))}
                className="flex-1 py-2 bg-violet-100 hover:bg-violet-200 dark:bg-violet-900/30 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded-xl font-bold transition-colors flex justify-center items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" /> Napisz
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-500" /> Obecności
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                {hasAttendanceData ? (
                  <>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${attendancePercentage > 75 ? 'bg-emerald-500' : attendancePercentage > 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${attendancePercentage}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-slate-500">
                      <span>Frekwencja: {attendancePercentage}% ({presentClasses}/{totalClasses})</span>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-500 text-sm italic">Brak danych o frekwencji.</p>
                )}
              </div>
            </div>
            <button className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors">
              Szczegóły obecności
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lewa kolumna: Grupy */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-violet-500" /> Przypisane Grupy
              </h3>
              <div className="flex flex-col gap-3">
                {groups.map((g: any) => {
                  const isAssigned = g.studentIds.includes(student.id);
                  return (
                    <button
                      key={g.id}
                      onClick={() => toggleGroup(g.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-colors flex justify-between items-center ${
                        isAssigned
                          ? "bg-violet-50 border-violet-200 dark:bg-violet-900/20 dark:border-violet-800/50"
                          : "bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-800/50"
                      }`}
                    >
                      <div>
                        <p className={`font-bold ${isAssigned ? "text-violet-900 dark:text-violet-100" : "text-slate-700 dark:text-slate-300"}`}>
                          {g.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {g.schedule}
                        </p>
                      </div>
                      {isAssigned && (
                        <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Prawa kolumna: Notatki */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Notatki dla nauczycieli */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[400px]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 shrink-0">
                <FileText className="w-5 h-5 text-violet-500" /> Historia Notatek i Informacji
              </h3>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
                {(!student.globalNotes || student.globalNotes.length === 0) ? (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <p className="text-slate-500 italic">Brak wpisów w historii ucznia.</p>
                  </div>
                ) : (
                  student.globalNotes.map((note: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-violet-600 dark:text-violet-400">{note.authorName}</span>
                        <span className="text-slate-400 text-xs bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">{note.date}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{note.text}</p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex gap-3 shrink-0 pt-4 border-t border-slate-100 dark:border-slate-800">
                <input
                  type="text"
                  id={`new-global-note-${student.id}`}
                  placeholder="Dodaj nową informację (widoczną dla nauczycieli)..."
                  className="flex-1 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      addGlobalNote(input.value);
                      input.value = "";
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = document.getElementById(`new-global-note-${student.id}`) as HTMLInputElement;
                    if (input) {
                      addGlobalNote(input.value);
                      input.value = "";
                    }
                  }}
                  className="px-6 py-2 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors shadow-lg shadow-violet-600/20"
                >
                  Dodaj wpis
                </button>
              </div>
            </div>

            {/* Notatki dla właściciela */}
            <div className="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-500" /> Notatki wewnętrzne (Poufne)
                </h3>
                <button 
                  onClick={saveNote}
                  className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" /> Zapisz
                </button>
              </div>
              <textarea 
                value={editingNote}
                onChange={e => setEditingNote(e.target.value)}
                placeholder="Poufne informacje, ustalenia finansowe, notatki dyrekcji..."
                className="w-full p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-slate-500 min-h-[150px] resize-y"
              ></textarea>
            </div>

          </div>
        </div>
      </main>

      {/* Payment History Modal */}
      <AnimatePresence>
        {showPaymentHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <History className="w-6 h-6 text-emerald-500" /> Historia wpłat
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">{student.name}</p>
                </div>
                <button onClick={() => setShowPaymentHistory(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {student.debt && student.debt > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800/50 mb-6 flex justify-between items-center">
                  <span className="font-bold text-red-800 dark:text-red-300">Aktualne zadłużenie:</span>
                  <span className="font-black text-xl text-red-600 dark:text-red-400">{student.debt} zł</span>
                </div>
              )}

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {!student.paymentHistory || student.paymentHistory.length === 0 ? (
                  <div className="text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                    <p className="text-slate-500">Brak zarejestrowanych wpłat.</p>
                  </div>
                ) : (
                  student.paymentHistory.map((payment: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${payment.status === 'Opłacone' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {payment.status === 'Opłacone' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{payment.date}</p>
                          <p className={`text-xs font-medium ${payment.status === 'Opłacone' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{payment.status}</p>
                        </div>
                      </div>
                      <span className="font-bold text-lg text-slate-900 dark:text-white">{payment.amount} zł</span>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setShowPaymentHistory(false)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
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
