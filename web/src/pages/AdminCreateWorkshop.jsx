import React, { useState } from 'react';
import { UploadCloud, Calendar, Clock, MapPin, Users, DollarSign, FileText } from 'lucide-react';

const AdminCreateWorkshop = () => {
  const [isDragging, setIsDragging] = useState(false);

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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Tạo Workshop mới</h1>
          <p className="text-gray-500 mt-2">Điền thông tin và tải lên tài liệu để AI tạo mô tả tự động.</p>
        </div>

        <form className="space-y-8">
          {/* Box 1: Thông tin cơ bản */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="text-blue-500" size={24} />
              Thông tin cơ bản
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tên sự kiện</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="Ví dụ: Kỹ năng phỏng vấn xin việc cho sinh viên IT"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Diễn giả</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="Ví dụ: Nguyễn Văn A - HR Manager"
                />
              </div>
            </div>
          </div>

          {/* Box 2: Thời gian & Địa điểm */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="text-blue-500" size={24} />
              Thời gian & Địa điểm
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày tổ chức</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="text-gray-400" size={20} />
                  </div>
                  <input type="date" className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 focus:bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Giờ tổ chức</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Clock className="text-gray-400" size={20} />
                  </div>
                  <input type="time" className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 focus:bg-white" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phòng / Địa điểm</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="text-gray-400" size={20} />
                  </div>
                  <input type="text" placeholder="Ví dụ: Hội trường lớn - Tòa A" className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 focus:bg-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Box 3: Vé & Số lượng */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="text-blue-500" size={24} />
              Vé & Số lượng
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Số lượng ghế</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Users className="text-gray-400" size={20} />
                  </div>
                  <input type="number" placeholder="100" className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 focus:bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Giá vé (VNĐ)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <DollarSign className="text-gray-400" size={20} />
                  </div>
                  <input type="number" placeholder="Để trống nếu Miễn phí" className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 focus:bg-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Box 4: Upload PDF cho AI */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              Tài liệu AI Summary
            </h2>
            <p className="text-gray-500 mb-6 text-sm">Hệ thống AI sẽ tự động phân tích và tạo khung "AI Summary" hấp dẫn cho sự kiện của bạn.</p>
            
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                  <UploadCloud size={32} />
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-1">
                Kéo & thả file PDF vào đây
              </p>
              <p className="text-gray-500 mb-4">hoặc click để chọn file từ máy tính</p>
              <span className="inline-block px-4 py-2 bg-purple-600 text-white font-medium rounded-lg shadow-sm hover:bg-purple-700 transition-colors">
                Tải lên tài liệu PDF để AI tự động tóm tắt
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button type="button" className="bg-blue-600 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1">
              Lưu & Tạo Workshop
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateWorkshop;
