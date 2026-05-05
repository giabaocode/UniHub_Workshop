import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Lock, Unlock, MoreVertical, X, Loader2, AlertTriangle } from 'lucide-react';
import { workshopService } from '../services/workshopService';

const AdminStaffManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchStaff = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/staff`, {
        headers: { "Authorization": `Bearer ${user?.token}` }
      });
      if (response.ok) {
        setStaffList(await response.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async () => {
    if (!formData.fullName || (!editingId && (!formData.email || !formData.password))) {
      Swal.fire("Vui lòng điền đủ thông tin bắt buộc!");
      return;
    }
    setIsSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const url = editingId 
        ? `${import.meta.env.VITE_API_BASE_URL}/users/staff/${editingId}`
        : `${import.meta.env.VITE_API_BASE_URL}/auth/create-staff`;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error(editingId ? "Lỗi khi cập nhật!" : "Lỗi khi tạo nhân sự!");
      Swal.fire(editingId ? "✅ Đã cập nhật thành công!" : "✅ Đã tạo tài khoản nhân sự thành công!");
      setIsModalOpen(false);
      setFormData({ fullName: '', email: '', password: '' });
      setEditingId(null);
      fetchStaff();
    } catch (e) {
      Swal.fire(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteConfirm = (staff) => {
    setDeleteModal({ isOpen: true, id: staff.id, name: staff.name });
  };

  const confirmDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/staff/${deleteModal.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${user?.token}` }
      });
      if (!response.ok) throw new Error("Lỗi khi xóa!");
      setDeleteModal({ isOpen: false, id: null, name: '' });
      fetchStaff();
    } catch (e) {
      Swal.fire(e.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (staff) => {
    setEditingId(staff.id);
    setFormData({ fullName: staff.name, email: staff.email, password: '' });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ fullName: '', email: '', password: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Nhân sự (Staff)</h1>
          <p className="text-gray-500 text-sm mt-1">Danh sách tài khoản hỗ trợ điểm danh và quản lý sự kiện.</p>
        </div>
        <button
          onClick={openCreateModal}
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
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" /></td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">Chưa có nhân sự nào được tạo.</td>
                </tr>
              ) : staffList.map((staff, index) => (
                <tr key={staff.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4 text-center text-gray-500 font-medium">{index + 1}</td>
                  <td className="p-4 font-semibold text-gray-900">{staff.name}</td>
                  <td className="p-4 text-gray-600">{staff.email}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      {staff.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(staff)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => openDeleteConfirm(staff)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Xóa tài khoản">
                        <Lock size={18} />
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
              <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Cập nhật nhân sự' : 'Thêm nhân sự mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
                <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Nhập tên nhân sự..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email đăng nhập {editingId && '(Không được sửa)'} <span className="text-red-500">*</span></label>
                <input type="email" disabled={!!editingId} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="example@unihub.edu.vn" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{editingId ? 'Mật khẩu mới (Để trống nếu không đổi)' : 'Mật khẩu khởi tạo'} <span className="text-red-500">*</span></label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors">
                Hủy
              </button>
              <button disabled={isSubmitting} onClick={handleCreateStaff} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all">
                {isSubmitting ? 'Đang tạo...' : 'Lưu tài khoản'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác nhận Xóa */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="p-6 pt-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4 mx-auto shadow-inner">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Khóa / Xóa tài khoản</h3>
              <p className="text-gray-500 text-sm">
                Bạn có chắc chắn muốn xóa quyền truy cập của nhân sự <br />
                <span className="font-bold text-gray-900 mt-1 inline-block">"{deleteModal.name}"</span> không?
              </p>
            </div>
            <div className="p-5 bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-all sm:w-auto w-full"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className={`px-6 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl shadow-lg transition-all sm:w-auto w-full flex items-center justify-center gap-2 ${isDeleting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-600 hover:-translate-y-0.5 shadow-red-500/30'}`}
              >
                {isDeleting ? <Loader2 className="animate-spin" size={18} /> : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaffManagement;
