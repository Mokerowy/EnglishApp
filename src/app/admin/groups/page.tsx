"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChevronLeft, Layers, Users, Plus, X, UserMinus, UserPlus, FileText, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Edit2 } from "lucide-react";
import { mockGroups, mockStudents, mockTeachers } from "@/lib/mockData";
import { usePersistentState } from "@/hooks/usePersistentState";

export default function AdminGroupsPage() {
  const [groups, setGroups] = usePersistentState('app-groups', mockGroups);
  const [students, setStudents] = usePersistentState('app-students', mockStudents); // Symulujemy globalną bazę uczniów
  const [teachers, setTeachers] = usePersistentState('app-teachers', mockTeachers); // Baza nauczycieli
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGroupData, setNewGroupData] = useState({ name: "", type: "Grupowe", level: "A1" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const groupName = params.get("group");
    if (groupName) {
      const group = groups.find((g: any) => g.name === groupName);
      if (group) {
        setSelectedGroup(group);
        setSearchTerm(groupName);
      }
    }
  }, []);

  const getStudentsInGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return [];
    return students.filter(s => group.studentIds.includes(s.id));
  };

  const getStudentsNotInAnyGroup = () => {
    const assignedStudentIds = new Set(groups.flatMap((g: any) => g.studentIds));
    return students.filter((s: any) => !assignedStudentIds.has(s.id));
  };

  const removeGroup = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Czy na pewno chcesz usunąć tę grupę?")) {
      setGroups(groups.filter((g: any) => g.id !== groupId));
    }
  };

  const removeStudentFromGroup = (studentId: string) => {
    if (!selectedGroup) return;
    const updatedGroup = {
      ...selectedGroup,
      studentIds: selectedGroup.studentIds.filter((id: string) => id !== studentId)
    };
    setSelectedGroup(updatedGroup);
    setGroups(groups.map((g: any) => g.id === updatedGroup.id ? updatedGroup : g));
  };

  const removeTeacherFromGroup = (teacherId: string) => {
    if (!selectedGroup) return;
    const updatedGroup = {
      ...selectedGroup,
      assignedTeachers: (selectedGroup.assignedTeachers || []).filter((id: string) => id !== teacherId)
    };
    setSelectedGroup(updatedGroup);
    setGroups(groups.map((g: any) => g.id === updatedGroup.id ? updatedGroup : g));
  };

  const addTeacherToGroup = (teacherId: string) => {
    if (!selectedGroup) return;
    const updatedGroup = {
      ...selectedGroup,
      assignedTeachers: [...(selectedGroup.assignedTeachers || []), teacherId]
    };
    setSelectedGroup(updatedGroup);
    setGroups(groups.map((g: any) => g.id === updatedGroup.id ? updatedGroup : g));
  };

  const addStudentToGroup = (studentId: string) => {
    if (!selectedGroup) return;
    const updatedGroup = {
      ...selectedGroup,
      studentIds: [...selectedGroup.studentIds, studentId]
    };
    setSelectedGroup(updatedGroup);
    setGroups(groups.map((g: any) => g.id === updatedGroup.id ? updatedGroup : g));
  };

  const createGroup = () => {
    const newGroup = {
      id: "g" + Date.now(),
      name: newGroupData.name || "Nowa Grupa",
      type: newGroupData.type,
      level: newGroupData.level,
      studentIds: [],
      assignedTeachers: [],
      globalNotes: []
    };
    setGroups([...groups, newGroup]);
    setIsCreateModalOpen(false);
    setNewGroupData({ name: "", type: "Grupowe", level: "A1" });
  };

  const startEditingName = (group: any) => {
    setEditingGroupId(group.id);
    setEditingGroupName(group.name);
  };

  const saveGroupName = (groupId: string) => {
    const updatedGroups = groups.map((g: any) => g.id === groupId ? { ...g, name: editingGroupName } : g);
    setGroups(updatedGroups);
    if (selectedGroup?.id === groupId) {
      setSelectedGroup({ ...selectedGroup, name: editingGroupName });
    }
    setEditingGroupId(null);
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
              <h1 className="font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white flex items-center gap-3">
                <Layers className="w-8 h-8 text-pink-500" /> Baza Grup
              </h1>
              <p className="text-base text-slate-500 dark:text-slate-400 mt-1">Zarządzaj zespołami uczniów</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {selectedGroup ? (
        <main className="max-w-6xl mx-auto px-4 mt-8 sm:mt-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button 
            onClick={() => setSelectedGroup(null)} 
            className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> Wróć do listy grup
          </button>
          
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-8">
            {/* Lewa kolumna: Informacje o grupie i przypisani uczniowie */}
            <div className="flex-1 border-r-0 md:border-r border-slate-200 dark:border-slate-800 pr-0 md:pr-8">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  {editingGroupId === selectedGroup.id ? (
                    <div className="flex items-center gap-2">
                      <input 
                        autoFocus
                        value={editingGroupName}
                        onChange={(e) => setEditingGroupName(e.target.value)}
                        className="text-3xl font-bold bg-transparent border-b-2 border-pink-500 focus:outline-none text-slate-900 dark:text-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveGroupName(selectedGroup.id);
                          if (e.key === 'Escape') setEditingGroupId(null);
                        }}
                      />
                      <button onClick={() => saveGroupName(selectedGroup.id)} className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"><Check className="w-6 h-6" /></button>
                      <button onClick={() => setEditingGroupId(null)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><X className="w-6 h-6" /></button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{selectedGroup.name}</h3>
                      <button onClick={() => startEditingName(selectedGroup)} className="text-slate-400 hover:text-pink-500 transition-colors">
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-sm font-bold rounded-lg border ${
                    selectedGroup.type === "Indywidualne" 
                      ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400"
                      : "bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-900/30 dark:border-pink-800 dark:text-pink-400"
                  }`}>
                    {selectedGroup.type}
                  </span>
                  <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-3 py-1 text-sm font-bold rounded-lg">
                    Poziom: {selectedGroup.level}
                  </span>
                </div>
              </div>

              <h4 className="font-bold text-xl text-slate-700 dark:text-slate-300 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-pink-500" /> Przypisani Uczniowie ({selectedGroup.studentIds.length})
              </h4>

              <div className="space-y-4">
                {getStudentsInGroup(selectedGroup.id).length === 0 ? (
                  <p className="text-slate-500 italic p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center border border-dashed border-slate-300 dark:border-slate-700">
                    Brak uczniów w tej grupie. Dodaj kogoś z listy obok.
                  </p>
                ) : (
                  getStudentsInGroup(selectedGroup.id).map(s => (
                    <div key={s.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 group/student hover:border-pink-300 dark:hover:border-pink-700 transition-colors">
                      <div>
                        <p className="font-bold text-lg text-slate-900 dark:text-white">{s.name}</p>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{(s as any).email || 'Brak email'} • {s.level}</p>
                      </div>
                      <button 
                        onClick={() => removeStudentFromGroup(s.id)}
                        className="p-3 text-red-500 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-900/30 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-sm"
                        title="Usuń z grupy"
                      >
                        <UserMinus className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <h4 className="font-bold text-xl text-slate-700 dark:text-slate-300 mt-8 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-pink-500" /> Przypisani Nauczyciele
              </h4>
              <div className="space-y-4">
                {!(selectedGroup.assignedTeachers && selectedGroup.assignedTeachers.length > 0) ? (
                  <p className="text-slate-500 italic p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center border border-dashed border-slate-300 dark:border-slate-700">
                    Brak nauczycieli przypisanych do tej grupy.
                  </p>
                ) : (
                  teachers.filter((t: any) => selectedGroup.assignedTeachers.includes(t.id)).map((t: any) => (
                    <div key={t.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 group/teacher hover:border-pink-300 dark:hover:border-pink-700 transition-colors">
                      <div>
                        <p className="font-bold text-lg text-slate-900 dark:text-white">{t.name}</p>
                      </div>
                      <button 
                        onClick={() => removeTeacherFromGroup(t.id)}
                        className="p-3 text-red-500 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-900/30 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-sm"
                        title="Usuń z grupy"
                      >
                        <UserMinus className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Prawa kolumna: Lista uczniów do dodania */}
            <div className="flex-1 pl-0 md:pl-4 flex flex-col">
              <h4 className="font-bold text-xl text-slate-700 dark:text-slate-300 mb-6 flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-emerald-500" /> Uczniowie Nieprzypisani
              </h4>

              <div className="space-y-4 overflow-y-auto pr-2 max-h-[70vh]">
                {getStudentsNotInAnyGroup().length === 0 ? (
                  <p className="text-slate-500 text-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                    Wszyscy uczniowie w szkole mają już przypisaną grupę.
                  </p>
                ) : (
                  getStudentsNotInAnyGroup().map((s: any) => (
                    <div key={s.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-colors">
                      <div>
                        <p className="font-bold text-lg text-slate-900 dark:text-white">{s.name}</p>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Poziom: {s.level}</p>
                      </div>
                      <button 
                        onClick={() => addStudentToGroup(s.id)}
                        className="px-4 py-2.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <Plus className="w-5 h-5" /> Dodaj
                      </button>
                    </div>
                  ))
                )}
              </div>

              <h4 className="font-bold text-xl text-slate-700 dark:text-slate-300 mt-8 mb-6 flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-emerald-500" /> Nauczyciele
              </h4>
              <div className="space-y-4 overflow-y-auto pr-2 max-h-[40vh]">
                {teachers.filter((t: any) => !(selectedGroup.assignedTeachers || []).includes(t.id)).length === 0 ? (
                  <p className="text-slate-500 text-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                    Wszyscy nauczyciele mają już przypisaną tę grupę.
                  </p>
                ) : (
                  teachers.filter((t: any) => !(selectedGroup.assignedTeachers || []).includes(t.id)).map((t: any) => (
                    <div key={t.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-colors">
                      <div>
                        <p className="font-bold text-lg text-slate-900 dark:text-white">{t.name}</p>
                      </div>
                      <button 
                        onClick={() => addTeacherToGroup(t.id)}
                        className="px-4 py-2.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <Plus className="w-5 h-5" /> Dodaj
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      ) : (
        <main className="max-w-6xl mx-auto px-4 mt-8 sm:mt-12 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Wszystkie Grupy
            </h2>
            
            <div className="flex w-full md:w-auto gap-4">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Szukaj grupy..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>
              
              <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-colors shrink-0 ${
                  isEditMode 
                    ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-lg shadow-slate-500/20" 
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                Edytuj
              </button>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-5 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-pink-600/20 shrink-0"
              >
                <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Utwórz Grupę</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500">
                  Nie znaleziono żadnych grup pasujących do kryteriów.
                </div>
              ) : groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase())).map(group => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col group/card"
                  onClick={() => setSelectedGroup(group)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                        group.type === "Indywidualne" 
                          ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400"
                          : "bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-900/30 dark:border-pink-800 dark:text-pink-400"
                      }`}>
                        {group.type}
                      </div>
                      <div className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-3 py-1 text-xs font-bold rounded-lg">
                        Poziom: {group.level}
                      </div>
                    </div>
                    {isEditMode && (
                      <button 
                        onClick={(e) => removeGroup(group.id, e)}
                        className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg dark:hover:bg-red-900/30 transition-colors"
                        title="Usuń grupę"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover/card:text-pink-600 dark:group-hover/card:text-pink-400 transition-colors">
                    {group.name}
                  </h3>
                  
                  <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Users className="w-5 h-5" />
                      <span className="font-medium">{group.studentIds.length} uczniów</span>
                    </div>
                    <span className="text-sm font-bold text-pink-600 dark:text-pink-400 opacity-0 group-hover/card:opacity-100 transition-opacity">Zarządzaj &rarr;</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </main>
      )}

      {/* MODAL: Tworzenie Nowej Grupy */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Utwórz nową grupę</h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nazwa grupy (np. Dzieci Wtorek)</label>
                  <input 
                    type="text" 
                    value={newGroupData.name}
                    onChange={e => setNewGroupData({...newGroupData, name: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Typ zajęć</label>
                  <select 
                    value={newGroupData.type}
                    onChange={e => setNewGroupData({...newGroupData, type: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="Grupowe">Grupowe</option>
                    <option value="Indywidualne">Indywidualne</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Poziom</label>
                  <select 
                    value={newGroupData.level}
                    onChange={e => setNewGroupData({...newGroupData, level: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="A1">A1 - Początkujący</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1 - Zaawansowany</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Anuluj
                </button>
                <button 
                  onClick={createGroup}
                  className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-pink-600/20"
                >
                  Utwórz
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
