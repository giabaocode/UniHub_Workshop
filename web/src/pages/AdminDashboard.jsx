import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Ticket, DollarSign, Edit, Trash2, PlusCircle, MoreVertical, Eye, Loader2, Search, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { workshopService } from '../services/workshopService';

const AdminDashboard = () => {
  const [workshops, setWorkshops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // STATE CHO SEARCH VÀ PHÂN TRANG
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 5;

  // --- MỚI: STATE QUẢN LÝ POPUP XÓA ---
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  // -----------------------------------

  const fetchWorkshops = async () => {
    setIsLoading(true);
    try {
      const data = await workshopService.getAllWorkshops();
      setWorkshops(data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu admin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  // BƯỚC 1: BẤM NÚT XÓA Ở DÒNG -> MỞ POPUP CHỨ CHƯA XÓA LIỀN
  const handleDeleteClick = (id, name) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  // BƯỚC 2: BẤM "XÓA VĨNH VIỄN" TRONG POPUP -> GỌI API
  const confirmDelete = async () => {
    if (isDeleting) return; // Đang xóa thì cấm bấm tiếp
    setIsDeleting(true);
    try {
      await workshopService.deleteWorkshop(deleteModal.id);
      setWorkshops(prev => prev.filter(ws => ws.id !== deleteModal.id));
      if (currentWorkshops.length === 1 && currentPage > 1) setCurrentPage(prev => prev - 1);
      setDeleteModal({ isOpen: false, id: null, name: '' });
    } catch (error) {
      alert("Lỗi khi xóa: " + (error.message || "Không xác định"));
    } finally {
      setIsDeleting(false); // Trả lại trạng thái
    }
  };

  // LOGIC SEARCH VÀ PHÂN TRANG
  const filteredWorkshops = workshops.filter(ws =>
    ws.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ws.room?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredWorkshops.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentWorkshops = filteredWorkshops.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const stats = {
    total: workshops.length,
    tickets: workshops.reduce((acc, curr) => acc + (curr.bookedSpots || 0), 0),
    revenue: workshops.reduce((acc, curr) => acc + ((curr.bookedSpots || 0) * (curr.price || 0)), 0)
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-gray-500 font-medium">Đang tải dữ liệu quản trị...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 relative">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<LayoutDashboard size={32} />} label="Tổng số Workshop" value={stats.total} color="blue" subValue="Toàn thời gian" />
        <StatCard icon={<Ticket size={32} />} label="Tổng vé đã bán" value={stats.tickets.toLocaleString()} color="purple" subValue="Đã xác nhận" />
        <StatCard icon={<DollarSign size={32} />} label="Doanh thu dự kiến" value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.revenue)} color="green" subValue="Chưa trừ phí" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
          <h2 className="text-lg font-bold text-gray-900">Danh sách Workshop</h2>
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={18} />
            </div>
            <input
              type="text"
              placeholder="Tìm tên sự kiện, phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm bg-gray-50 focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                <th className="p-4">Tên Sự kiện</th>
                <th className="p-4">Ngày giờ</th>
                <th className="p-4">Địa điểm</th>
                <th className="p-4">Tỷ lệ lấp đầy</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {currentWorkshops.length > 0 ? (
                currentWorkshops.map((ws) => (
                  // ĐỔI SANG DÙNG handleDeleteClick 
                  <WorkshopRow key={ws.id} ws={ws} onDelete={handleDeleteClick} />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">Không tìm thấy workshop nào phù hợp.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Hiển thị <span className="font-bold text-gray-900">{startIndex + 1}</span> đến <span className="font-bold text-gray-900">{Math.min(startIndex + itemsPerPage, filteredWorkshops.length)}</span> trong số <span className="font-bold text-gray-900">{filteredWorkshops.length}</span> kết quả
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* POPUP XÁC NHẬN XÓA (MODAL) CỰC XỊN XÒ */}
      {/* ================================================= */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="p-6 pt-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4 mx-auto shadow-inner">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cảnh báo xóa sự kiện</h3>
              <p className="text-gray-500 text-sm">
                Bạn có chắc chắn muốn xóa vĩnh viễn sự kiện <br />
                <span className="font-bold text-gray-900 mt-1 inline-block">"{deleteModal.name}"</span> không?
              </p>
              <div className="mt-4 bg-red-50 text-red-600 text-xs font-medium p-3 rounded-xl border border-red-100">
                Lưu ý: Hành động này không thể hoàn tác và có thể ảnh hưởng đến các sinh viên đã mua vé.
              </div>
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
                {isDeleting ? <Loader2 className="animate-spin" size={18} /> : 'Xóa vĩnh viễn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ... Các Component con StatCard và WorkshopRow giữ nguyên như trước

const StatCard = ({ icon, label, value, color, subValue }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600"
  };
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-md transition-all">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-[10px] text-green-500 font-bold mt-1 uppercase tracking-tight">{subValue}</p>
      </div>
    </div>
  );
};

const WorkshopRow = ({ ws, onDelete }) => {
  const registered = ws.bookedSpots || 0;
  const progress = ws.totalSeats > 0 ? Math.round((registered / ws.totalSeats) * 100) : 0;

  const today = new Date().toISOString().split('T')[0];
  const isPast = ws.eventDate < today;

  return (
    <tr className="hover:bg-blue-50/30 transition-colors">
      <td className="p-4 font-semibold text-gray-900 max-w-xs">
        <Link to={`/admin/workshop/${ws.id}/attendees`} className="truncate block hover:text-blue-600 transition-colors" title={ws.title}>
          {ws.title}
        </Link>
      </td>
      <td className="p-4 text-gray-600">
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">{ws.eventDate ? ws.eventDate.split('-').reverse().join('/') : '??'}</span>
          <span className="text-xs text-gray-400 mt-0.5">{ws.startTime?.substring(0, 5) || '--:--'}</span>
        </div>
      </td>
      <td className="p-4 text-gray-600">{ws.room}</td>
      <td className="p-4">
        <div className="flex flex-col gap-1.5 w-32">
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className="text-gray-700">{registered}/{ws.totalSeats}</span>
            <span className="text-blue-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </td>
      <td className="p-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPast ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-600 border border-blue-100'
          }`}>
          {isPast ? 'Đã kết thúc' : 'Sắp diễn ra'}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center justify-end gap-1">
          <Link to={`/admin/workshop/${ws.id}/attendees`} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Danh sách">
            <Eye size={18} />
          </Link>
          <Link to={`/admin/edit/${ws.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa">
            <Edit size={18} />
          </Link>
          {/* NÚT XÓA Ở ĐÂY SẼ GỌI HAM HANDLE_DELETE_CLICK (MỞ POPUP) */}
          <button onClick={() => onDelete(ws.id, ws.title)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AdminDashboard;