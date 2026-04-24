import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, User, ChevronRight } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

const formatDate = (dateString) => {
  if (!dateString) return "Chưa xác định";
  const [y, m, d] = dateString.split('-');
  return `${d}/${m}/${y}`;
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const WorkshopCard = ({ workshop }) => {
  const bookedSpots = 0; 
  const spotsLeft = workshop.totalSeats - bookedSpots;
  const progressPercentage = workshop.totalSeats > 0 ? (bookedSpots / workshop.totalSeats) * 100 : 0;
  const isAlmostFull = spotsLeft > 0 && spotsLeft <= (workshop.totalSeats * 0.2);
  const isFull = spotsLeft === 0;
  const isFree = workshop.price === 0 || workshop.price === null;
  const fallbackImage = "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80";

  return (
    <Link 
      to={`/workshop/${workshop.id}`} 
      className="glass rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 flex flex-col h-full group cursor-pointer border border-white/50 hover:border-blue-200 relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <img 
          src={workshop.coverImageUrl || fallbackImage} 
          alt={workshop.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
        
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <span className={`px-4 py-1.5 text-sm font-extrabold rounded-full shadow-lg backdrop-blur-md border ${
            isFree ? 'bg-emerald-500/90 text-white border-emerald-400/50' : 'bg-amber-500/90 text-white border-amber-400/50'
          }`}>
            {isFree ? '✨ MIỄN PHÍ' : formatPrice(workshop.price)}
          </span>
        </div>

        <h3 className="absolute bottom-4 left-4 right-4 text-xl font-bold text-white line-clamp-2 leading-snug drop-shadow-md group-hover:text-blue-300 transition-colors">
          {workshop.title}
        </h3>
      </div>

      <div className="p-6 flex-grow flex flex-col relative z-10 bg-white/40">
        <div className="space-y-3 text-sm text-gray-700 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0"><User size={14} /></div>
            <span className="font-medium truncate">{workshop.speaker}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0"><Calendar size={14} /></div>
            <span>{formatDate(workshop.eventDate)} • {workshop.startTime ? workshop.startTime.substring(0, 5) : '--:--'}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0"><MapPin size={14} /></div>
            <span className="truncate">{workshop.room}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-200/50">
          {workshop.registrationDeadline && (
            <div className="mb-5">
              {/* ĐÃ CHUYỂN TITLE VÀO BÊN TRONG COMPONENT */}
              <CountdownTimer 
                targetDate={workshop.registrationDeadline} 
                title="Đóng đăng ký sau"
                expiredMessage="Đã đóng đăng ký" 
              />
            </div>
          )}
          
          <div className="mb-5">
            <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wider">
              <span className="text-gray-500">Tình trạng vé</span>
              <span className={isFull ? "text-gray-500" : (isAlmostFull ? "text-red-500" : "text-blue-600")}>
                {isFull ? "Đã bán hết" : `${bookedSpots}/${workshop.totalSeats} vé`}
              </span>
            </div>
            <div className="w-full bg-gray-200/50 rounded-full h-2.5 overflow-hidden backdrop-blur-sm">
              <div 
                className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden ${isFull ? 'bg-gray-400' : (isAlmostFull ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-blue-400')}`}
                style={{ width: `${progressPercentage}%` }}
              >
                {!isFull && <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_ease-in-out_infinite]"></div>}
              </div>
            </div>
          </div>

          <div className="w-full py-3 bg-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 text-blue-600 hover:text-white border border-blue-100 hover:border-transparent rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
            Xem chi tiết <ChevronRight size={18} className="transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default WorkshopCard;