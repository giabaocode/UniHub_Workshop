import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, Ticket, DollarSign, Edit, Trash2, PlusCircle, MoreVertical, Eye } from 'lucide-react';

const AdminDashboard = () => {
  // Mock data for workshops
  const workshops = [
    { id: 1, name: 'Kỹ năng phỏng vấn xin việc', date: '25/04/2026', time: '08:00', location: 'Hội trường A', registered: 85, total: 100, status: 'Sắp diễn ra' },
    { id: 2, name: 'AI trong kỷ nguyên số', date: '30/04/2026', time: '14:00', location: 'Phòng 302', registered: 50, total: 50, status: 'Đã kết thúc' },
    { id: 3, name: 'Workshop ReactJS nâng cao', date: '05/05/2026', time: '09:00', location: 'Hội trường B', registered: 120, total: 200, status: 'Sắp diễn ra' },
    { id: 4, name: 'Khởi nghiệp cho sinh viên', date: '10/05/2026', time: '13:30', location: 'Phòng 105', registered: 30, total: 150, status: 'Sắp diễn ra' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan Hệ thống</h1>
          <p className="text-gray-500 text-sm mt-1">Theo dõi các chỉ số quan trọng của nền tảng UniHub</p>
        </div>
        <Link 
          to="/admin/create" 
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
        >
          <PlusCircle size={20} />
          <span>Tạo Workshop mới</span>
        </Link>
      </div>

      {/* 3 Thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-md transition-shadow">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <LayoutDashboard size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Tổng số Workshop</p>
            <h3 className="text-3xl font-bold text-gray-900">42</h3>
            <p className="text-xs text-green-500 font-medium mt-1">+3 trong tháng này</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-md transition-shadow">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Ticket size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Tổng vé đã bán</p>
            <h3 className="text-3xl font-bold text-gray-900">1,254</h3>
            <p className="text-xs text-green-500 font-medium mt-1">+12% so với tuần trước</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-md transition-shadow">
          <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <DollarSign size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Doanh thu ước tính</p>
            <h3 className="text-3xl font-bold text-gray-900">85.5M</h3>
            <p className="text-xs text-green-500 font-medium mt-1">+5.2M tuần này</p>
          </div>
        </div>
      </div>

      {/* Bảng quản lý Workshop */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-bold text-gray-900">Danh sách Workshop</h2>
          <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                <th className="p-4">Tên Sự kiện</th>
                <th className="p-4">Ngày giờ</th>
                <th className="p-4">Địa điểm</th>
                <th className="p-4">Số ghế</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {workshops.map((ws) => (
                <tr key={ws.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4 font-semibold text-gray-900">
                    <Link to={`/admin/workshop/${ws.id}/attendees`} className="hover:text-blue-600 transition-colors">
                      {ws.name}
                    </Link>
                  </td>
                  <td className="p-4 text-gray-600">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">{ws.date}</span>
                      <span className="text-xs text-gray-500 mt-0.5">{ws.time}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{ws.location}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-700">{ws.registered}/{ws.total}</span>
                        <span className="text-gray-500">{Math.round((ws.registered/ws.total)*100)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${ws.registered === ws.total ? 'bg-green-500' : 'bg-blue-500'}`} 
                          style={{ width: `${(ws.registered / ws.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      ws.status === 'Sắp diễn ra' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}>
                      {ws.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/workshop/${ws.id}/attendees`} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Xem danh sách tham dự">
                        <Eye size={18} />
                      </Link>
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
