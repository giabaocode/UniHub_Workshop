import React, { useState } from 'react';
import { Clock, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import CustomDatePicker from '../components/CustomDatePicker';
import CustomTimePicker from '../components/CustomTimePicker';
import ImageUploader from '../components/ImageUploader';
import AiPdfUploader from '../components/AiPdfUploader';
import { workshopService } from '../services/workshopService';
import { handleNumberKeyDown } from '../utils/helpers'; 

const AdminCreateWorkshop = () => {
  const [formData, setFormData] = useState({
    title: "", speaker: "", eventDate: "", startTime: "", room: "",
    totalSeats: "", price: "", registrationDeadlineDate: "", registrationDeadlineTime: "",
    description: "", coverImageUrl: "", 
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'totalSeats' || name === 'price') {
      if (value !== '' && !/^\d+$/.test(value)) {
        setErrors(prev => ({ ...prev, [name]: 'Chỉ được nhập số nguyên dương!' }));
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (url) => {
    setFormData(prev => ({ ...prev, coverImageUrl: url }));
    setErrors(prev => ({ ...prev, coverImageUrl: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const todayDateStr = new Date().toISOString().split('T')[0];
    const todayDateTime = new Date();
    const currentTimeStr = `${String(todayDateTime.getHours()).padStart(2, '0')}:${String(todayDateTime.getMinutes()).padStart(2, '0')}`;
    const newErrors = {};

    if (!formData.coverImageUrl) newErrors.coverImageUrl = 'Vui lòng tải lên ảnh bìa cho sự kiện!';
    if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập tên sự kiện!';
    if (!formData.speaker.trim()) newErrors.speaker = 'Vui lòng nhập tên diễn giả!';
    
    if (formData.eventDate) {
        if (formData.eventDate < todayDateStr) newErrors.eventDate = 'Ngày tổ chức không được nhỏ hơn ngày hiện tại!';
        else if (formData.eventDate === todayDateStr && formData.startTime && formData.startTime < currentTimeStr) 
            newErrors.startTime = 'Giờ bắt đầu phải lớn hơn giờ hiện tại!';
    }

    if (formData.registrationDeadlineDate) {
        if (formData.registrationDeadlineDate < todayDateStr) newErrors.registrationDeadlineDate = 'Ngày đóng đăng ký không được trong quá khứ!';
        else if (formData.registrationDeadlineDate === todayDateStr && formData.registrationDeadlineTime && formData.registrationDeadlineTime < currentTimeStr) 
            newErrors.registrationDeadlineTime = 'Giờ đóng đăng ký phải lớn hơn giờ hiện tại!';
        
        if (formData.eventDate && formData.registrationDeadlineDate > formData.eventDate) 
            newErrors.registrationDeadlineDate = 'Ngày đóng vượt quá ngày diễn ra!';
        else if (formData.eventDate && formData.registrationDeadlineDate === formData.eventDate && formData.registrationDeadlineTime && formData.startTime && formData.registrationDeadlineTime >= formData.startTime) 
            newErrors.registrationDeadlineTime = 'Giờ đóng đăng ký phải trước giờ bắt đầu!';
    }

    if (formData.totalSeats === '') newErrors.totalSeats = 'Vui lòng nhập số lượng ghế!';
    else if (!/^\d+$/.test(formData.totalSeats) || Number(formData.totalSeats) < 0) newErrors.totalSeats = 'Chỉ nhập số nguyên dương!';

    if (formData.price !== '' && (!/^\d+$/.test(formData.price) || Number(formData.price) < 0)) newErrors.price = 'Giá vé chỉ nhập số nguyên dương!';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      ...formData,
      totalSeats: formData.totalSeats ? parseInt(formData.totalSeats) : 0,
      price: formData.price ? parseFloat(formData.price) : 0.0,
      startTime: formData.startTime.length === 5 ? formData.startTime : null,
      registrationDeadline: formData.registrationDeadlineDate && formData.registrationDeadlineTime 
        ? `${formData.registrationDeadlineDate}T${formData.registrationDeadlineTime}` : null
    };

    try {
      await workshopService.createWorkshop(payload);
      alert("Tạo Workshop thành công!");
      navigate("/admin"); 
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Thêm mới Workshop</h1>
        <p className="text-gray-500 text-sm mt-1">Cung cấp thông tin chi tiết và tài liệu để hệ thống tự động thiết lập.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CỘT TRÁI (FORM) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Thông tin cơ bản</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tên sự kiện <span className="text-red-500">*</span></label>
              <input name='title' value={formData.title} onChange={handleChange} type="text" className={`w-full px-4 py-3 rounded-xl border ${errors.title ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'} focus:ring-4 outline-none transition-all bg-gray-50/50 focus:bg-white text-sm`} placeholder="Nhập tên workshop..." />
              {errors.title && <p className="text-red-500 text-xs mt-1 font-medium">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tên diễn giả <span className="text-red-500">*</span></label>
              <input name='speaker' value={formData.speaker} onChange={handleChange} type="text" className={`w-full px-4 py-3 rounded-xl border ${errors.speaker ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'} focus:ring-4 outline-none transition-all bg-gray-50/50 focus:bg-white text-sm`} placeholder="Nhập tên diễn giả..." />
              {errors.speaker && <p className="text-red-500 text-xs mt-1 font-medium">{errors.speaker}</p>}
            </div>
            <div className="grid grid-cols-2 gap-6 relative z-30">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày tổ chức <span className="text-red-500">*</span></label>
                <CustomDatePicker name="eventDate" value={formData.eventDate} onChange={handleChange} placeholder="DD/MM/YYYY" min={new Date().toISOString().split('T')[0]} />
                {errors.eventDate && <p className="text-red-500 text-xs mt-1 font-medium">{errors.eventDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Giờ bắt đầu</label>
                <CustomTimePicker name="startTime" value={formData.startTime} onChange={handleChange} placeholder="--:--" icon={Clock} />
                {errors.startTime && <p className="text-red-500 text-xs mt-1 font-medium">{errors.startTime}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 relative z-20">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày đóng đăng ký</label>
                <CustomDatePicker name="registrationDeadlineDate" value={formData.registrationDeadlineDate} onChange={handleChange} placeholder="DD/MM/YYYY" min={new Date().toISOString().split('T')[0]} max={formData.eventDate || null} />
                {errors.registrationDeadlineDate && <p className="text-red-500 text-xs mt-1 font-medium">{errors.registrationDeadlineDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Giờ đóng đăng ký</label>
                <CustomTimePicker name="registrationDeadlineTime" value={formData.registrationDeadlineTime} onChange={handleChange} placeholder="--:--" icon={Timer} />
                {errors.registrationDeadlineTime && <p className="text-red-500 text-xs mt-1 font-medium">{errors.registrationDeadlineTime}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phòng / Địa điểm</label>
              <input name='room' value={formData.room} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-gray-50/50 focus:bg-white text-sm" placeholder="Ví dụ: Hội trường A, Tầng 3" />
            </div>
            <div className="grid grid-cols-2 gap-6 relative z-10">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Số lượng ghế</label>
                <input name='totalSeats' value={formData.totalSeats} onChange={handleChange} onKeyDown={handleNumberKeyDown} type="text" inputMode="numeric" className={`w-full px-4 py-3 rounded-xl border ${errors.totalSeats ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'} focus:ring-4 outline-none transition-all bg-gray-50/50 focus:bg-white text-sm`} placeholder="Ví dụ: 100" />
                {errors.totalSeats && <p className="text-red-500 text-xs mt-1 font-medium">{errors.totalSeats}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Giá vé (VNĐ)</label>
                <input name='price' value={formData.price} onChange={handleChange} onKeyDown={handleNumberKeyDown} type="text" inputMode="numeric" className={`w-full px-4 py-3 rounded-xl border ${errors.price ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'} focus:ring-4 outline-none transition-all bg-gray-50/50 focus:bg-white text-sm`} placeholder="0 nếu Miễn phí" />
                {errors.price && <p className="text-red-500 text-xs mt-1 font-medium">{errors.price}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (LINH KIỆN ĐÃ ĐƯỢC TÁCH) */}
        <div className="lg:col-span-5 space-y-6">
          <ImageUploader value={formData.coverImageUrl} onChange={handleImageChange} error={errors.coverImageUrl} />
          <AiPdfUploader />
        </div>
      </div>

      <div className="flex justify-end items-center gap-4 pt-4">
        <button onClick={() => navigate('/admin')} className="px-8 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all">Hủy</button>
        <button onClick={handleSubmit} className="px-8 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5">Lưu & Đăng Sự kiện</button>
      </div>
    </div>
  );
};

export default AdminCreateWorkshop;