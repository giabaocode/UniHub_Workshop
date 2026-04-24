import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle, XCircle, Ticket, Users, CheckSquare } from 'lucide-react';

const AdminWorkshopAttendees = () => {
  const { id } = useParams();
  // Mock data based on id
  const workshopName = id === '1' ? 'Kỹ năng phỏng vấn xin việc' : 'Workshop số ' + id;
  
  const [stats, setStats] = useState({
    total: 85,
    checkedIn: 60,
    notCheckedIn: 25
  });

  const initialAttendees = [
    { id: 1, ticketCode: 'TK-001', name: 'Nguyễn Văn A', studentId: 'SE150001', payment: 'Đã thanh toán', isCheckedIn: true },
    { id: 2, ticketCode: 'TK-002', name: 'Trần Thị B', studentId: 'SE150002', payment: 'Miễn phí', isCheckedIn: false },
    { id: 3, ticketCode: 'TK-003', name: 'Lê Văn C', studentId: 'SE150003', payment: 'Đã thanh toán', isCheckedIn: true },
    { id: 4, ticketCode: 'TK-004', name: 'Phạm Thị D', studentId: 'SE150004', payment: 'Đã thanh toán', isCheckedIn: false },
    { id: 5, ticketCode: 'TK-005', name: 'Hoàng Văn E', studentId: 'SE150005', payment: 'Miễn phí', isCheckedIn: false },
  ];

  const [attendees, setAttendees] = useState(initialAttendees);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCheckIn = (attendeeId) => {
    setAttendees(attendees.map(a => 
      a.id === attendeeId ? { ...a, isCheckedIn: true } : a
    ));
    setStats(prev => ({
      ...prev,
      checkedIn: prev.checkedIn + 1,
      notCheckedIn: prev.notCheckedIn - 1
    }));
  };

  const filteredAttendees = attendees.filter(a => 
    a.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* Header & Back Button */}
      <div className="flex flex-col gap-4">
        <Link to="/admin" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors w-fit group">
          <ArrowLeft size={18} className="mr-1.5 group-hover:-translate-x-1 transition-transform" />
          Quay lại Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Danh sách tham dự: <span className="text-blue-600">{workshopName}</span></h1>
          <div className="flex gap-2">
            <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              Nhập CSV
            </button>
            <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 font-bold rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-200 shadow-sm text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Xuất CSV
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Ticket size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-0.5">Tổng số vé đã bán</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
            <CheckSquare size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-0.5">Số người đã Check-in</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.checkedIn}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-0.5">Số người chưa Check-in</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.notCheckedIn}</h3>
          </div>
        </div>
      </div>

      {/* Table & Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
          <h2 className="text-lg font-bold text-gray-900">Danh sách Sinh viên</h2>
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Tìm kiếm Mã vé, Tên, MSSV..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                <th className="p-4 w-16 text-center">STT</th>
                <th className="p-4">Mã Vé</th>
                <th className="p-4">Họ Tên</th>
                <th className="p-4">MSSV</th>
                <th className="p-4">Thanh toán</th>
                <th className="p-4">Trạng thái Check-in</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredAttendees.length > 0 ? (
                filteredAttendees.map((attendee, index) => (
                  <tr key={attendee.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 text-center text-gray-500 font-medium">{index + 1}</td>
                    <td className="p-4 font-mono font-semibold text-gray-700">{attendee.ticketCode}</td>
                    <td className="p-4 font-semibold text-gray-900">{attendee.name}</td>
                    <td className="p-4 text-gray-600">{attendee.studentId}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md border ${
                        attendee.payment === 'Đã thanh toán' 
                          ? 'bg-blue-50 text-blue-700 border-blue-100' 
                          : 'bg-purple-50 text-purple-700 border-purple-100'
                      }`}>
                        {attendee.payment}
                      </span>
                    </td>
                    <td className="p-4">
                      {attendee.isCheckedIn ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle size={14} className="text-green-500" /> Đã Check-in
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                          <XCircle size={14} className="text-gray-400" /> Chưa Check-in
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {!attendee.isCheckedIn ? (
                        <button 
                          onClick={() => handleCheckIn(attendee.id)}
                          className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
                        >
                          Check-in thủ công
                        </button>
                      ) : (
                        <span className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-gray-400 bg-gray-50 rounded-lg border border-gray-100 cursor-not-allowed">
                          Đã hoàn tất
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
                    <Search size={40} className="text-gray-300 mb-3" />
                    <p>Không tìm thấy sinh viên nào phù hợp với từ khóa.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminWorkshopAttendees;
