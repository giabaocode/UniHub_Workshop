import React, { useState } from 'react';
import { UploadCloud, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminCreateWorkshop = () => {
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    // Xử lý file
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Thêm mới Workshop</h1>
        <p className="text-gray-500 text-sm mt-1">Cung cấp thông tin chi tiết và tài liệu để hệ thống tự động thiết lập.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cột trái: Thông tin cơ bản (Chiếm 7 cột) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Thông tin cơ bản</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tên sự kiện <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50 focus:bg-white text-sm"
                placeholder="Nhập tên workshop..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tên diễn giả <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50 focus:bg-white text-sm"
                placeholder="Nhập tên diễn giả..."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày tổ chức</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50 focus:bg-white text-sm text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Giờ bắt đầu</label>
                <input 
                  type="time" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50 focus:bg-white text-sm text-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phòng / Địa điểm</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50 focus:bg-white text-sm"
                placeholder="Ví dụ: Hội trường A, Tầng 3"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Số lượng ghế</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50 focus:bg-white text-sm"
                  placeholder="Ví dụ: 100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Giá vé (VNĐ)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50 focus:bg-white text-sm"
                  placeholder="0 nếu Miễn phí"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Khu vực AI & Tài liệu (Chiếm 5 cột) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">AI Smart Assistant</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">Hỗ trợ trích xuất thông tin tự động từ tài liệu</p>
          </div>

          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex-1 min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
              isDragging 
                ? 'border-blue-500 bg-blue-50/50' 
                : 'border-gray-300 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors duration-200 ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-400 shadow-sm border border-gray-100'}`}>
              <UploadCloud size={32} />
            </div>
            
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Kéo thả file PDF vào đây
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
              hoặc click để chọn file. Hệ thống AI sẽ tự động đọc và tóm tắt nội dung Workshop.
            </p>
            
            <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl shadow-sm hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-colors focus:ring-2 focus:ring-blue-500 outline-none">
              Duyệt file từ máy tính
            </button>
          </div>

          <div className="mt-6 flex items-start gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
            <CheckCircle2 className="text-blue-500 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>Mẹo:</strong> Upload outline hoặc slide bài giảng để AI tự động tạo mô tả sự kiện hấp dẫn, đề xuất câu hỏi Q&A và tags phù hợp.
            </p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end items-center gap-4 pt-4">
        <button 
          onClick={() => navigate('/admin')}
          className="px-8 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
        >
          Hủy
        </button>
        <button className="px-8 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5">
          Lưu & Đăng Sự kiện
        </button>
      </div>
    </div>
  );
};

export default AdminCreateWorkshop;
