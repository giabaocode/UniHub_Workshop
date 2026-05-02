import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, Clock, MapPin, User, Ticket as TicketIcon } from 'lucide-react';
import ticketService from '../services/ticket.service';
import { Link } from 'react-router-dom';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await ticketService.getMyTickets();
        setTickets(data);
      } catch (err) {
        setError(err.message || 'Lỗi khi tải danh sách vé');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);


  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Vé của tôi</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
            {error}
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-200 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
              <TicketIcon size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Bạn chưa có vé nào</h3>
            <p className="text-gray-500 max-w-md">Hãy tìm hiểu các workshop đang mở đăng ký và đăng ký tham gia ngay nhé.</p>
          </div>
        ) : (
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
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-4 line-clamp-2 pr-4">
  <Link 
    to={`/workshop/${ticket.workshopId}`} 
    className="hover:text-blue-600 hover:underline transition-all cursor-pointer"
  >
    {ticket.title}
  </Link>
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
        )}
      </div>
    </div>
  );
};

export default MyTickets;
