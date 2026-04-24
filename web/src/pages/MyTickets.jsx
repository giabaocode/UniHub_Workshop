import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

const MyTickets = () => {
  const tickets = [
    {
      id: "TICK-837492",
      title: "Kỹ năng phỏng vấn xin việc cho sinh viên IT",
      speaker: "Nguyễn Văn A",
      date: "25/04/2026",
      time: "08:00 - 11:30",
      room: "Hội trường lớn",
      status: "Sắp diễn ra",
      qrValue: "TICK-837492"
    },
    {
      id: "TICK-992384",
      title: "Định hướng nghề nghiệp Data Science 2026",
      speaker: "Trần Thị B",
      date: "26/04/2026",
      time: "13:30 - 16:30",
      room: "Phòng A102",
      status: "Đã xác nhận",
      qrValue: "TICK-992384"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Vé của tôi</h1>
        
        <div className="space-y-6">
          {tickets.map(ticket => (
            <div key={ticket.id} className="relative bg-white rounded-2xl shadow-sm flex flex-col md:flex-row overflow-hidden border border-gray-200">
              {/* Ticket cut corner effect - Left */}
              <div className="absolute top-1/2 -left-3 w-6 h-6 bg-gray-100 rounded-full transform -translate-y-1/2 hidden md:block border-r border-gray-200"></div>
              {/* Ticket cut corner effect - Right */}
              <div className="absolute top-1/2 -right-3 w-6 h-6 bg-gray-100 rounded-full transform -translate-y-1/2 hidden md:block border-l border-gray-200"></div>
              
              <div className="absolute top-1/2 left-0 right-0 border-t-2 border-dashed border-gray-200 md:hidden"></div>

              {/* Thông tin vé */}
              <div className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                      {ticket.status}
                    </span>
                    <span className="text-sm font-mono text-gray-400">#{ticket.id}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 pr-4">
                    {ticket.title}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span>{ticket.speaker}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{ticket.room}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span>{ticket.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <span>{ticket.time}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Đường đứt nét phân cách */}
              <div className="hidden md:block w-0 border-l-2 border-dashed border-gray-200 my-4"></div>

              {/* QR Code Section */}
              <div className="p-6 md:p-8 bg-gray-50 flex flex-col items-center justify-center md:w-64 flex-shrink-0">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 mb-3">
                  <QRCodeSVG value={ticket.qrValue} size={120} level={"H"} />
                </div>
                <p className="text-xs text-gray-500 font-medium text-center uppercase tracking-widest">Quét để check-in</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyTickets;
