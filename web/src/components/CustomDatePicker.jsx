import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const CustomDatePicker = ({ value, onChange, name, placeholder, min, max }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = min ? new Date(min) : null;
  const maxDate = max ? new Date(max) : null;
  if (minDate) minDate.setHours(0, 0, 0, 0);
  if (maxDate) maxDate.setHours(0, 0, 0, 0);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const handleSelectDate = (day) => {
    if (!day) return;
    const selectedDate = new Date(year, month, day);
    if (minDate && selectedDate < minDate) return;
    if (maxDate && selectedDate > maxDate) return;
    
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange({ target: { name, value: dateString } });
    setIsOpen(false);
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return placeholder;
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="relative w-full">
      <div 
        onClick={() => setIsOpen(true)}
        className="w-full h-[48px] px-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition-all"
      >
        <Calendar size={18} strokeWidth={2.5} className={isOpen ? "text-blue-600" : "text-gray-400"} />
        <span className={`flex-1 text-left text-sm font-medium ${value ? 'text-gray-700' : 'text-gray-400'}`}>
          {formatDateDisplay(value)}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
      </div>

      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>}

      {isOpen && (
        <div className="absolute z-50 mt-2 w-[280px] bg-white border border-gray-200 rounded-xl shadow-xl shadow-blue-900/10 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-4">
            <button 
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="font-bold text-gray-800 text-sm">{monthNames[month]} {year}</div>
            <button 
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(d => (
              <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="h-8"></div>;
              
              const cellDate = new Date(year, month, day);
              const isToday = cellDate.getTime() === today.getTime();
              const isSelected = value === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isDisabled = (minDate && cellDate < minDate) || (maxDate && cellDate > maxDate);

              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => handleSelectDate(day)}
                  disabled={isDisabled}
                  className={`h-8 w-full flex items-center justify-center rounded-lg text-sm font-medium transition-all
                    ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 
                      isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105' : 
                      isToday ? 'bg-blue-50 text-blue-600 border border-blue-200' : 
                      'text-gray-700 hover:bg-gray-100'}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;