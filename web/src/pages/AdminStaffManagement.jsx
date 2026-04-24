import React, { useState } from 'react';
import { PlusCircle, Edit, Lock, Unlock, MoreVertical, X } from 'lucide-react';

const AdminStaffManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const staffList = [
    { id: 1, name: 'Nguyễn Văn Admin', email: 'admin@unihub.edu.vn', status: 'Hoạt động' },
    { id: 2, name: 'Trần Thị Hỗ Trợ', email: 'support1@unihub.edu.vn', status: 'Hoạt động' },
    { id: 3, name: 'Lê Văn Sự Kiện', email: 'event_staff@unihub.edu.vn', status: 'Khóa' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Nhân sự (Staff)</h1>
          <p className="text-gray-500 text-sm mt-1">Danh sách tài khoản hỗ trợ điểm danh và quản lý sự kiện.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
        >
          <PlusCircle size={20} />
          <span>Thêm Nhân sự mới</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-bold text-gray-900">Danh sách nhân viên</h2>
          <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                <th className="p-4 w-16 text-center">STT</th>
                <th className="p-4">Họ Tên</th>
                <th className="p-4">Email đăng nhập</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {staffList.map((staff, index) => (
                <tr key={staff.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4 text-center text-gray-500 font-medium">{index + 1}</td>
                  <td className="p-4 font-semibold text-gray-900">{staff.name}</td>
                  <td className="p-4 text-gray-600">{staff.email}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      staff.status === 'Hoạt động' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa">
                        <Edit size={18} />
                      </button>
                      <button className={`p-2 rounded-lg transition-colors ${staff.status === 'Hoạt động' ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`} title={staff.status === 'Hoạt động' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
                        {staff.status === 'Hoạt động' ? <Lock size={18} /> : <Unlock size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50 text-xs text-gray-500 italic border-t border-gray-100 text-center">
          Tài khoản nhân sự được dùng để đăng nhập vào Mobile App quét mã QR.
        </div>
      </div>

      {/* Modal Thêm Nhân sự */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animation-fade-in px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Thêm nhân sự mới</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Nhập tên nhân sự..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email đăng nhập <span className="text-red-500">*</span></label>
                <input type="email" placeholder="example@unihub.edu.vn" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu khởi tạo <span className="text-red-500">*</span></label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors">
                Hủy
              </button>
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all">
                Lưu tài khoản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaffManagement;
