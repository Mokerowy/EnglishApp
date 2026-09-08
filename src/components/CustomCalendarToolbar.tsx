"use client";

import React from 'react';
import { ToolbarProps } from 'react-big-calendar';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export function CustomCalendarToolbar(props: ToolbarProps) {
  const { date, onNavigate, onView, view, views } = props;

  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  const months = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", 
    "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
  ];

  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(date);
    newDate.setMonth(parseInt(e.target.value));
    onNavigate('DATE', newDate);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(date);
    newDate.setFullYear(parseInt(e.target.value));
    onNavigate('DATE', newDate);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-slate-200 dark:border-slate-700">
      
      {/* Klawisze Nawigacji */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onNavigate('TODAY')}
          className="px-4 py-2 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
        >
          Dzisiaj
        </button>
        <button 
          onClick={() => onNavigate('PREV')}
          className="p-2 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={() => onNavigate('NEXT')}
          className="p-2 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Szybki Wybór Daty */}
      <div className="flex items-center gap-2 font-bold text-lg">
        <CalendarIcon className="w-6 h-6 text-blue-500 mr-2" />
        <select 
          value={currentMonth} 
          onChange={handleMonthChange}
          className="p-2 bg-transparent border-none text-slate-900 dark:text-white cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {months.map((m, i) => (
            <option key={i} value={i} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{m}</option>
          ))}
        </select>
        
        <select 
          value={currentYear} 
          onChange={handleYearChange}
          className="p-2 bg-transparent border-none text-slate-900 dark:text-white cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {years.map(y => (
            <option key={y} value={y} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{y}</option>
          ))}
        </select>
      </div>

      {/* Zmiana Widoku */}
      <div className="flex bg-slate-200 dark:bg-slate-900 p-1 rounded-xl">
        {(views as string[]).map(v => (
          <button
            key={v}
            onClick={() => onView(v as any)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              view === v 
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {v === 'month' ? 'Miesiąc' : v === 'week' ? 'Tydzień' : v === 'day' ? 'Dzień' : 'Plan'}
          </button>
        ))}
      </div>

    </div>
  );
}
