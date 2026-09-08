"use client";

import React, { useState, useMemo } from 'react'
import { Calendar, dateFnsLocalizer, View, Views, EventProps } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { pl } from 'date-fns/locale'
import "react-big-calendar/lib/css/react-big-calendar.css"
import { useTheme } from "next-themes";
import { CustomCalendarToolbar } from './CustomCalendarToolbar';

const locales = {
  'pl': pl,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: pl }),
  getDay,
  locales,
})

interface SchoolCalendarProps {
  events: any[];
  defaultView?: View;
  defaultDate?: Date;
  selectable?: boolean;
  highlightEventId?: string | number;
  onSelectSlot?: (slotInfo: { start: Date; end: Date; action: 'select' | 'click' | 'doubleClick' }) => void;
  onSelectEvent?: (event: any) => void;
}

const CustomEvent = ({ event }: EventProps<any>) => {
  return (
    <div className="flex flex-col h-full overflow-hidden leading-tight justify-start pt-0.5">
      <span className="font-bold text-[11px] sm:text-xs">Zajęcia</span>
      <span className="text-[10px] sm:text-[11px] font-medium opacity-90 truncate">
        {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
      </span>
      {event.reported && (
        <span className="inline-block text-[9px] font-bold bg-white/30 px-1 py-0.5 mt-0.5 rounded-sm text-white uppercase tracking-wider max-w-max truncate">
          Zastępstwo
        </span>
      )}
    </div>
  );
};

export function SchoolCalendar({ 
  events, 
  defaultView = Views.WEEK, 
  defaultDate,
  selectable = false, 
  highlightEventId,
  onSelectSlot, 
  onSelectEvent 
}: SchoolCalendarProps) {
  const [view, setView] = useState<View>(defaultView)
  const [date, setDate] = useState<Date>(defaultDate || new Date())
  const { resolvedTheme } = useTheme();

  const eventPropGetter = (event: any) => {
    let className = '';
    const style: any = {};
    
    if (highlightEventId && event.id.toString() === highlightEventId.toString()) {
      className = 'highlighted-event animate-pulse';
    } else if (event.reported) {
      className = 'reported-event animate-pulse';
    }

    if (event.color && !className) {
      style.backgroundColor = event.color;
      style.borderColor = event.color;
    }

    return { className, style };
  };

  const { components } = useMemo(() => ({
    components: {
      toolbar: CustomCalendarToolbar,
      event: CustomEvent,
    },
  }), []);

  return (
    <div className={`h-[800px] w-full rounded-2xl overflow-hidden ${resolvedTheme === 'dark' ? 'rbc-dark-theme' : ''}`}>
      <style jsx global>{`
        /* Modern Calendar Aesthetics */
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-header {
          padding: 12px 4px;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.75rem;
          color: #475569;
          border-bottom: 2px solid #e2e8f0;
        }
        .rbc-time-header-content {
          border-left: 1px solid #f1f5f9;
        }
        .rbc-time-content {
          border-top: 1px solid #f1f5f9;
        }
        .rbc-time-slot {
          border-top: 1px solid #f8fafc;
        }
        .rbc-day-bg + .rbc-day-bg {
          border-left: 1px solid #f1f5f9;
        }
        .rbc-today {
          background-color: #f0fdf4 !important;
        }
        .rbc-event {
          background-color: #3b82f6;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 2px 4px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          overflow: hidden !important;
          box-sizing: border-box;
        }
        .rbc-event-label {
          display: none !important;
        }
        .rbc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
        }
        
        /* Dark Mode Overrides */
        .rbc-dark-theme .rbc-calendar {
          color: #e2e8f0;
        }
        .rbc-dark-theme .rbc-header {
          color: #94a3b8;
          border-color: #334155;
        }
        .rbc-dark-theme .rbc-month-view,
        .rbc-dark-theme .rbc-time-view,
        .rbc-dark-theme .rbc-month-row,
        .rbc-dark-theme .rbc-day-bg,
        .rbc-dark-theme .rbc-timeslot-group,
        .rbc-dark-theme .rbc-time-content,
        .rbc-dark-theme .rbc-time-header-content {
          border-color: #334155;
        }
        .rbc-dark-theme .rbc-time-slot,
        .rbc-dark-theme .rbc-day-bg + .rbc-day-bg {
          border-color: #1e293b;
        }
        .rbc-dark-theme .rbc-off-range-bg {
          background-color: #0f172a;
        }
        .rbc-dark-theme .rbc-today {
          background-color: #064e3b !important;
        }
        .rbc-dark-theme .rbc-event {
          background-color: #2563eb;
        }
        
        /* Buttons */
        .rbc-btn-group button {
          border-radius: 8px;
          border-color: #e2e8f0;
          font-weight: 600;
          transition: all 0.2s;
        }
        .rbc-dark-theme .rbc-btn-group button {
          border-color: #334155;
          color: #e2e8f0;
        }
        .rbc-dark-theme .rbc-btn-group button.rbc-active {
          background-color: #334155;
          box-shadow: none;
        }
        .rbc-dark-theme .rbc-btn-group button:hover {
          background-color: #1e293b;
        }
        
        /* Highlighted/Reported */
        .highlighted-event {
          background-color: #ef4444 !important;
          border: 2px solid #b91c1c !important;
          box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.5) !important;
          color: white !important;
          z-index: 50 !important;
        }
        .reported-event {
          background-color: #ef4444 !important;
          border: 2px solid #b91c1c !important;
          color: white !important;
          z-index: 40 !important;
        }
      `}</style>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={setView}
        date={date}
        onNavigate={(newDate) => setDate(newDate)}
        culture="pl"
        messages={{
          next: "Następny",
          previous: "Poprzedni",
          today: "Dzisiaj",
          month: "Miesiąc",
          week: "Tydzień",
          day: "Dzień",
          agenda: "Plan",
        }}
        min={new Date(2020, 1, 1, 8, 0, 0)} // Start at 8 AM
        max={new Date(2020, 1, 1, 23, 59, 59)} // End at midnight
        selectable={selectable}
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        eventPropGetter={eventPropGetter}
        components={components}
      />
    </div>
  )
}
