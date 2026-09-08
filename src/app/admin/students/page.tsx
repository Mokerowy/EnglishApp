"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChevronLeft, Users, UserPlus, Search, Edit3, X, FileText, Save, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { mockStudents, mockGroups } from "@/lib/mockData";
import { usePersistentState } from "@/hooks/usePersistentState";

export default function AdminStudentsPage() {
  const router = useRouter();
  const [students, setStudents] = usePersistentState('app-students', mockStudents.map((s: any) => ({ ...s, note: s.note || "", globalNotes: s.globalNotes || [] })));
  const [groups, setGroups] = usePersistentState('app-groups', mockGroups);
  
  const [searchTerm, setSearchTerm] = useState("");
  
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentLevel, setNewStudentLevel] = useState("A1");

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [editingNote, setEditingNote] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const studentName = params.get("student");
    if (studentName) {
      const student = students.find((s: any) => s.name === studentName);
      if (student) {
        setSelectedStudent(student);
        setEditingNote(student.note || "");
        setSearchTerm(studentName);
      }
    }
  }, []); // Run only once on mount

  const addStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName) return;
    
    const newStudentId = "s" + Date.now();
    setStudents([...students, { 
      id: newStudentId, 
      name: newStudentName, 
      email: newStudentEmail || "brak@email.com",
      phone: "---",
      level: newStudentLevel,
      status: "Aktywny",
      note: "" 
    }]);
    setNewStudentName("");
    setNewStudentEmail("");
    
    router.push(`/admin/students/${newStudentId}`);
  };

  const saveNote = () => {
    if (selectedStudent) {
      setStudents(students.map((s: any) => s.id === selectedStudent.id ? { ...s, note: editingNote } : s));
      setSelectedStudent({ ...selectedStudent, note: editingNote });
    }
  };

  const addGlobalNote = (noteText: string) => {
    if (!selectedStudent || !noteText.trim()) return;
    const newNote = {
      authorId: "admin",
      authorName: "Właściciel",
      text: noteText,
      date: new Date().toLocaleDateString('pl-PL')
    };
    
    const updatedStudent = {
      ...selectedStudent,
      globalNotes: [...(selectedStudent.globalNotes || []), newNote]
    };
    
    setStudents(students.map((s: any) => s.id === selectedStudent.id ? updatedStudent : s));
    setSelectedStudent(updatedStudent);
  };

  const toggleGroup = (groupId: string) => {
    if (!selectedStudent) return;
    
    setGroups(groups.map((g: any) => {
      if (g.id === groupId) {
        const isMember = g.studentIds.includes(selectedStudent.id);
        if (isMember) {
          return { ...g, studentIds: g.studentIds.filter((id: string) => id !== selectedStudent.id) };
        } else {
          return { ...g, studentIds: [...g.studentIds, selectedStudent.id] };
        }
      }
      return g;
    }));
  };

  const filteredStudents = students.filter((s: any) => 
    (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.level || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStudentGroups = (studentId: string) => {
    return groups.filter((g: any) => g.studentIds.includes(studentId));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-20">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ChevronLeft className="w-8 h-8" />
            </Link>
            <div>
              <h1 className="font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">Baza Uczniów</h1>
              <p className="text-base text-slate-500 dark:text-slate-400 mt-1">Zarządzaj uczniami</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 sm:mt-12 space-y-8">
        
        {/* Dodawanie Ucznia */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-violet-500" /> Dodaj nowego ucznia
          </h2>
          
          <form onSubmit={addStudent} className="flex flex-col sm:flex-row gap-4 mb-2 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Imię i nazwisko ucznia</label>
              <input 
                type="text" 
                placeholder="Np. Jan Kowalski"
                value={newStudentName}
                onChange={e => setNewStudentName(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Email</label>
              <input 
                type="email" 
                placeholder="jan@example.com"
                value={newStudentEmail}
                onChange={e => setNewStudentEmail(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <div className="sm:w-48">
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Poziom</label>
              <select 
                value={newStudentLevel}
                onChange={e => setNewStudentLevel(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
              >
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-violet-600/20">
                Dodaj
              </button>
            </div>
          </form>
        </div>

        {/* Lista Uczniów */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-violet-500" /> Lista Uczniów
            </h2>
            
            {/* Wyszukiwarka */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Szukaj ucznia..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-slate-800">
                  <th className="py-4 px-4 text-slate-500 dark:text-slate-400 font-bold">Imię i nazwisko</th>
                  <th className="py-4 px-4 text-slate-500 dark:text-slate-400 font-bold">Grupy zajęciowe</th>
                  <th className="py-4 px-4 text-slate-500 dark:text-slate-400 font-bold text-center">Notatki</th>
                  <th className="py-4 px-4 text-slate-500 dark:text-slate-400 font-bold text-right">Profil</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">Nie znaleziono żadnych uczniów pasujących do kryteriów.</td>
                  </tr>
                ) : filteredStudents.map(s => {
                  const studentGroups = getStudentGroups(s.id);
                  return (
                  <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                      {s.name}
                      <span className="block text-xs font-normal text-slate-500">{s.email} • Poziom {s.level}</span>
                    </td>
                    <td className="py-4 px-4">
                      {studentGroups.length === 0 ? (
                        <span className="text-slate-400 text-sm italic">Brak przypisanych grup</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {studentGroups.map(g => (
                            <Link href={`/admin/groups?group=${encodeURIComponent(g.name)}`} key={g.id} className="inline-flex items-center gap-1 px-3 py-1 bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 rounded-lg text-xs font-bold hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-colors border border-pink-200 dark:border-pink-800/50 group">
                              <Layers className="w-3 h-3 group-hover:scale-110 transition-transform" />
                              {g.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {s.note ? (
                        <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 rounded-md text-xs font-bold" title={s.note}>
                          Posiada
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link 
                        href={`/admin/students/${s.id}`}
                        className="p-2 text-slate-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 dark:hover:text-violet-400 rounded-lg transition-colors inline-block"
                      >
                        <Edit3 className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Profil Ucznia Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">{selectedStudent.email} • {selectedStudent.phone}</p>
                </div>
                <button onClick={() => setSelectedStudent(null)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 p-2 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Poziom</p>
                  <p className="font-bold text-slate-900 dark:text-white text-lg">{selectedStudent.level}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Status</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{selectedStudent.status}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <Layers className="w-4 h-4 text-violet-500" /> Przypisane Grupy
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {groups.map((g: any) => {
                    const isAssigned = g.studentIds.includes(selectedStudent.id);
                    return (
                      <button
                        key={g.id}
                        onClick={() => toggleGroup(g.id)}
                        className={`p-3 rounded-xl border text-sm font-bold text-left transition-colors ${
                          isAssigned
                            ? "bg-violet-100 border-violet-300 text-violet-800 dark:bg-violet-900/40 dark:border-violet-700 dark:text-violet-300"
                            : "bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 hover:border-violet-300 dark:hover:border-violet-700"
                        }`}
                      >
                        {g.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <FileText className="w-4 h-4 text-violet-500" /> Notatki Globalne (widoczne dla nauczycieli)
                </label>
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2">
                  {(!selectedStudent.globalNotes || selectedStudent.globalNotes.length === 0) ? (
                    <p className="text-sm text-slate-500 italic">Brak notatek o tym uczniu.</p>
                  ) : (
                    selectedStudent.globalNotes.map((note: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="font-bold text-violet-600 dark:text-violet-400">{note.authorName}</span>
                          <span className="text-slate-400 text-xs">{note.date}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">{note.text}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id={`new-global-note-${selectedStudent.id}`}
                    placeholder="Dodaj nową globalną notatkę..."
                    className="flex-1 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 text-sm"
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
                      const input = document.getElementById(`new-global-note-${selectedStudent.id}`) as HTMLInputElement;
                      if (input) {
                        addGlobalNote(input.value);
                        input.value = "";
                      }
                    }}
                    className="px-4 py-2 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors"
                  >
                    Dodaj
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <FileText className="w-4 h-4 text-slate-400" /> Notatki wewnętrzne (Tylko dla administracji)
                </label>
                <textarea 
                  value={editingNote}
                  onChange={e => setEditingNote(e.target.value)}
                  placeholder="Brak notatek. Dodaj informacje o uczniu, preferencje, problemy z płatnościami itp."
                  className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 min-h-[100px] resize-y text-sm"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="px-5 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Anuluj
                </button>
                <button 
                  onClick={() => { saveNote(); setSelectedStudent(null); }}
                  className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-violet-600/20 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Zapisz zmiany
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
