import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate, expiredMessage = "Đã diễn ra", title }) => {
  const calculateTimeLeft = () => {
    let targetTime;
    if (!targetDate) return { expired: true }; 

    if (typeof targetDate === 'string') {
      if (targetDate.includes('/')) {
        const [datePart, timePart] = targetDate.split(' ');
        const [day, month, year] = datePart.split('/');
        const [hours, minutes] = timePart ? timePart.split(':') : ['00', '00'];
        targetTime = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`).getTime();
      } else {
        targetTime = new Date(targetDate).getTime();
      }
    } else {
      targetTime = new Date(targetDate).getTime();
    }

    const difference = targetTime - new Date().getTime();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  // NẾU ĐÃ HẾT HẠN -> CHỈ HIỆN DUY NHẤT CÁI Ô MÀU ĐỎ NÀY (Không hiện title nữa)
  if (timeLeft.expired) {
    return (
      <div className="flex justify-center items-center p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 font-bold text-sm uppercase tracking-wider">
        {expiredMessage}
      </div>
    );
  }

  const timeBlocks = [
    { label: 'Ngày', value: timeLeft.days },
    { label: 'Giờ', value: timeLeft.hours },
    { label: 'Phút', value: timeLeft.minutes },
    { label: 'Giây', value: timeLeft.seconds }
  ];

  return (
    <div>
      {/* NẾU CHƯA HẾT HẠN VÀ CÓ TRUYỀN TITLE -> HIỆN TITLE */}
      {title && (
        <div className="text-center text-xs font-bold mb-3 uppercase tracking-wider text-gray-500">
          {title}
        </div>
      )}
      
      {/* KHUNG ĐỒNG HỒ */}
      <div className="flex gap-2 justify-center">
        {timeBlocks.map((block, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg shadow-sm flex items-center justify-center border border-blue-100 mb-1">
              <span className="text-lg md:text-xl font-bold text-blue-600">
                {block.value.toString().padStart(2, '0')}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
              {block.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;