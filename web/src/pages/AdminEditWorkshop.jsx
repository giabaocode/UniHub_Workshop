import React, { useState, useEffect } from 'react'; // FIX: Đã thêm useEffect
import { Clock, Timer, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import CustomDatePicker from '../components/CustomDatePicker';
import CustomTimePicker from '../components/CustomTimePicker';
import ImageUploader from '../components/ImageUploader';
import AiPdfUploader from '../components/AiPdfUploader';
import { workshopService } from '../services/workshopService';
import { handleNumberKeyDown } from '../utils/helpers';

const AdminEditWorkshop = () => {
    const [formData, setFormData] = useState({
        title: "", speaker: "", eventDate: "", startTime: "", room: "",
        totalSeats: "", price: "", registrationDeadlineDate: "", registrationDeadlineTime: "",
        description: "", coverImageUrl: "", pdfUrl: "", aiSummary: "",
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            setIsLoading(true);
            try {
                const data = await workshopService.getWorkshopById(id);
                setFormData({
                    title: data.title || "",
                    speaker: data.speaker || "",
                    // FIX: Thêm dấu ? để tránh sập trang nếu data bị null
                    eventDate: data.eventDate ? data.eventDate.split('T')[0] : "",
                    startTime: data.startTime || "",
                    room: data.room || "",
                    totalSeats: data.totalSeats || "",
                    price: data.price || "",
                    registrationDeadlineDate: data.registrationDeadline ? data.registrationDeadline.split('T')[0] : "",
                    registrationDeadlineTime: data.registrationDeadline && data.registrationDeadline.includes('T') ? data.registrationDeadline.split('T')[1] : "",
                    description: data.description || "",
                    coverImageUrl: data.coverImageUrl || "",
                    pdfUrl: data.pdfUrl || "",
                    aiSummary: data.aiSummary || "",
                })
            } catch (error) {
                console.error('Error fetching workshop detail:', error);
                alert("Không thể tải thông tin Workshop!");
                navigate('/admin');
            } finally {
                setIsLoading(false);
            }
        }
        fetchDetail();
    }, [id, navigate]);

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

    const handleAiPdfResult = (result) => {
        if (result) {
            setFormData(prev => ({
                ...prev,
                pdfUrl: result.pdfUrl || '',
                // Tóm tắt chi tiết cho vào description
                description: result.detailedSummary || prev.description,
                // Tóm tắt ngắn cho vào aiSummary (AI Card)
                aiSummary: `[SUMMARY]\n${result.briefSummary}\n[HASHTAGS]\n${(result.hashtags || []).join(', ')}`,
            }));
        } else {
            setFormData(prev => ({ ...prev, pdfUrl: '', aiSummary: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        const newErrors = {};

        if (!formData.coverImageUrl) newErrors.coverImageUrl = 'Vui lòng tải lên ảnh bìa cho sự kiện!';
        if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập tên sự kiện!';
        if (!formData.speaker.trim()) newErrors.speaker = 'Vui lòng nhập tên diễn giả!';

        // Ghi chú: Đã bỏ logic chặn ngày quá khứ ở form Edit để Admin có thể sửa lỗi chính tả cho các Workshop cũ.
        if (formData.registrationDeadlineDate && formData.eventDate && formData.registrationDeadlineDate > formData.eventDate) {
            newErrors.registrationDeadlineDate = 'Ngày đóng vượt quá ngày diễn ra!';
        } else if (formData.eventDate && formData.registrationDeadlineDate === formData.eventDate && formData.registrationDeadlineTime && formData.startTime && formData.registrationDeadlineTime >= formData.startTime) {
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
            startTime: formData.startTime?.length === 5 ? formData.startTime : null,
            registrationDeadline: formData.registrationDeadlineDate && formData.registrationDeadlineTime
                ? `${formData.registrationDeadlineDate}T${formData.registrationDeadlineTime}` : null
        };

        try {
            setIsSubmitting(true);

            await workshopService.updateWorkshop(id, payload);
            alert("Cập nhật Workshop thành công!");
            navigate("/admin");
        } catch (error) {
            alert("Lỗi: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                <p className="text-gray-500 font-medium">Đang tải dữ liệu sự kiện...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
            <div className="mb-8">
                {/* FIX: Đổi tiêu đề cho đúng */}
                <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa Workshop</h1>
                <p className="text-gray-500 text-sm mt-1">Cập nhật thông tin chi tiết cho sự kiện này.</p>
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
                                {/* Đã bỏ thuộc tính min để có thể sửa sự kiện cũ */}
                                <CustomDatePicker name="eventDate" value={formData.eventDate} onChange={handleChange} placeholder="DD/MM/YYYY" />
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
                                <CustomDatePicker name="registrationDeadlineDate" value={formData.registrationDeadlineDate} onChange={handleChange} placeholder="DD/MM/YYYY" max={formData.eventDate || null} />
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
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả workshop / Nội dung chương trình</label>
                            <textarea
                                name='description'
                                value={formData.description}
                                onChange={handleChange}
                                rows={6}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-gray-50/50 focus:bg-white text-sm resize-none"
                                placeholder="Nhập mô tả chi tiết hoặc upload PDF để AI tự điền..."
                            />
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI (LINH KIỆN ĐÃ ĐƯỢC TÁCH) */}
                <div className="lg:col-span-5 space-y-6">
                    <ImageUploader value={formData.coverImageUrl} onChange={handleImageChange} error={errors.coverImageUrl} />
                    <AiPdfUploader onResult={handleAiPdfResult} />
                </div>
            </div>

            <div className="flex justify-end items-center gap-4 pt-4">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`px-8 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-lg transition-all transform flex items-center justify-center gap-2
          ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 hover:-translate-y-0.5 shadow-blue-500/30'}
      `}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            Đang xử lý...
                        </>
                    ) : (
                        'Cập nhật thay đổi'
                    )}
                </button>
            </div>
        </div>
    );
};

// FIX: Export đúng tên Component
export default AdminEditWorkshop;