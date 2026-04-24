import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Sparkles, CheckCircle2 } from 'lucide-react';
import CheckoutModal from '../components/CheckoutModal';

const WorkshopDetail = () => {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cột trái: Thông tin chính */}
          <div className="lg:w-2/3 space-y-8">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <div className="h-64 md:h-96 relative">
                <img 
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                  alt="Workshop cover" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 font-bold rounded-full shadow-sm border border-emerald-200">
                    Miễn phí
                  </span>
                </div>
              </div>
              
              <div className="p-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                  Kỹ năng phỏng vấn xin việc cho sinh viên IT
                </h1>
                
                <div className="flex flex-wrap gap-6 text-gray-600 mb-8 pb-8 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-medium">Diễn giả</p>
                      <p className="font-semibold text-gray-900">Nguyễn Văn A</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-medium">Ngày tổ chức</p>
                      <p className="font-semibold text-gray-900">25/04/2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-medium">Thời gian</p>
                      <p className="font-semibold text-gray-900">08:00 - 11:30</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Nội dung chương trình</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Buổi workshop cung cấp các kiến thức thực tế về quy trình phỏng vấn tại các công ty công nghệ lớn. Bạn sẽ được hướng dẫn cách tối ưu CV, trả lời các câu hỏi hành vi, và vượt qua vòng phỏng vấn kỹ thuật thuật toán.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-gray-600">
                      <CheckCircle2 className="text-emerald-500 mt-1 flex-shrink-0" size={20} />
                      <span>Cách viết CV chuẩn ATS cho lập trình viên.</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-600">
                      <CheckCircle2 className="text-emerald-500 mt-1 flex-shrink-0" size={20} />
                      <span>Các dạng câu hỏi phỏng vấn thuật toán (Whiteboard interview).</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-600">
                      <CheckCircle2 className="text-emerald-500 mt-1 flex-shrink-0" size={20} />
                      <span>Thực hành phỏng vấn trực tiếp 1-1 với nhà tuyển dụng.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Sơ đồ phòng</h3>
                  <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden group cursor-pointer">
                    <div className="text-center group-hover:scale-105 transition-transform">
                      <MapPin size={48} className="mx-auto text-blue-400 mb-3" />
                      <p className="font-semibold text-gray-600">Hội trường lớn - Tòa A</p>
                      <p className="text-sm text-gray-400">Click để xem bản đồ chi tiết</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: AI Summary & Đăng ký */}
          <div className="lg:w-1/3 space-y-6">
            {/* Khung nổi bật AI Summary */}
            <div className="relative group">
              {/* Gradient border */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              
              <div className="relative bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-purple-500 animate-pulse" size={24} />
                  <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    AI Summary
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  🤖 <strong>AI Tóm tắt:</strong> Workshop kéo dài 3.5 giờ, tập trung mạnh vào kỹ năng thực chiến. Đặc biệt phù hợp cho sinh viên năm 3, năm 4 chuẩn bị đi thực tập. Điểm nhấn: Sẽ có 5 phần quà là học bổng khóa học tiếng Anh giao tiếp cho người may mắn.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs font-semibold rounded-md">#PhỏngVấn</span>
                  <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs font-semibold rounded-md">#ThựcTập</span>
                  <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs font-semibold rounded-md">#NghềNghiệp</span>
                </div>
              </div>
            </div>

            {/* Thẻ hiển thị giá vé & Đăng ký */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Thông tin đăng ký</h3>
              <div className="flex justify-between items-end py-4 border-b border-gray-100 mb-6">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Giá vé</p>
                  <p className="text-3xl font-extrabold text-gray-900">Miễn phí</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 font-medium">Số lượng còn</p>
                  <p className="text-lg font-bold text-blue-600">15/100 chỗ</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1"
              >
                Đăng ký ngay
              </button>
              <p className="text-center text-sm text-gray-400 mt-4">
                Hạn chót đăng ký: 24/04/2026
              </p>
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        workshopTitle="Kỹ năng phỏng vấn xin việc cho sinh viên IT" 
        price="Miễn phí" 
      />
    </div>
  );
};

export default WorkshopDetail;
