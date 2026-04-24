import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomTimePicker = ({ value, onChange, name, placeholder, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  const currentHour = value ? value.split(':')[0] : '';
  const currentMinute = value ? value.split(':')[1] : '';

  const handleTimeSelect = (type, val) => {
    let newHour = currentHour || '08';
    let newMinute = currentMinute || '00';
    if (type === 'hour') newHour = val;
    if (type === 'minute') newMinute = val;
    onChange({ target: { name, value: `${newHour}:${newMinute}` } });
  };

  return (
    <div className="relative w-full">
      <div 
        onClick={() => setIsOpen(true)}
        className="w-full h-[48px] px-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition-all"
      >
        {/* Render icon được truyền từ ngoài vào */}
        <Icon size={18} strokeWidth={2.5} className={isOpen ? "text-blue-600" : "text-gray-400"} />
        <span className={`flex-1 text-left text-sm font-medium ${value ? 'text-gray-700' : 'text-gray-400'}`}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
      </div>

      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>}

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl shadow-blue-900/10 p-2 flex gap-2 h-[220px] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex-1 overflow-y-auto scrollbar-hide rounded-lg bg-gray-50 border border-gray-100 relative">
            <div className="sticky top-0 bg-gray-100 z-20 py-2 border-b border-gray-200 w-full shadow-sm">
              <div className="text-[11px] font-bold text-gray-500 text-center uppercase tracking-wider">Giờ</div>
            </div>
            <div className="p-1 space-y-1">
              {hours.map(h => (
                <button
                  type="button"
                  key={h}
                  onClick={() => handleTimeSelect('hour', h)}
                  className={`w-full py-2 text-sm font-medium rounded-md transition-colors ${currentHour === h ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-hide rounded-lg bg-gray-50 border border-gray-100 relative">
            <div className="sticky top-0 bg-gray-100 z-20 py-2 border-b border-gray-200 w-full shadow-sm">
              <div className="text-[11px] font-bold text-gray-500 text-center uppercase tracking-wider">Phút</div>
            </div>
            <div className="p-1 space-y-1">
              {minutes.map(m => (
                <button
                  type="button"
                  key={m}
                  onClick={() => handleTimeSelect('minute', m)}
                  className={`w-full py-2 text-sm font-medium rounded-md transition-colors ${currentMinute === m ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTimePicker;