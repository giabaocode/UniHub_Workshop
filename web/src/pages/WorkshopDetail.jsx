import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Sparkles, CheckCircle2, Users, RefreshCw, FileText, Loader2 } from 'lucide-react';
import CheckoutModal from '../components/CheckoutModal';
import CountdownTimer from '../components/CountdownTimer';
import geminiService from '../services/gemini.service';
import { workshopService } from '../services/workshopService';
import { useParams, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import ticketService from '../services/ticket.service';

const WorkshopDetail = () => {
  const { id } = useParams();
  const [workshop, setWorkshop] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const navigate = useNavigate();

  // AI Summary state
  const [aiSummary, setAiSummary] = useState('');
  const [aiHashtags, setAiHashtags] = useState([]);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState('');
  const [paymentData, setPaymentData] = useState(null);

  // Fetch workshop data from API
  useEffect(() => {
    const fetchWorkshopAndStatus = async () => {
      setIsLoading(true);
      try {
        const data = await workshopService.getWorkshopById(id);
        setWorkshop(data);

        // Kiểm tra vé
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
          const check = await ticketService.checkRegistration(id);
          setIsRegistered(check.isRegistered);
        }

        // Logic AI giữ nguyên...
        if (data.aiSummary) {
          const summaryMatch = data.aiSummary.match(/\[SUMMARY\]([\s\S]*?)\[HASHTAGS\]/i);
          const tagsMatch = data.aiSummary.match(/\[HASHTAGS\]([\s\S]*)/i);
          if (summaryMatch) setAiSummary(summaryMatch[1].trim());
          else setAiSummary(data.aiSummary);
          if (tagsMatch) setAiHashtags(tagsMatch[1].trim().split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean));
          setAiLoading(false);
        } else {
          fetchAiSummary(data);
        }
      } catch (err) {
        setLoadError('Không thể tải thông tin workshop.');
        setAiLoading(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkshopAndStatus();
  }, [id]);

  const fetchAiSummary = async (ws) => {
    const workshopData = ws || workshop;
    if (!workshopData) return;

    setAiLoading(true);
    setAiError('');
    try {
      const result = await geminiService.summarizeWorkshop({
        title: workshopData.title,
        description: workshopData.description || '',
        agenda: [],
      });
      setAiSummary(result.summary);
      setAiHashtags(result.hashtags || []);
    } catch (err) {
      setAiError('Không thể tải AI Summary. ' + (err.message || ''));
    } finally {
      setAiLoading(false);
    }
  };

  const handleRegisterClick = async () => {
    // Nếu đã đăng ký, chuyển hướng thẳng sang trang xem vé
    if (isRegistered) {
      navigate('/my-tickets');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      Swal.fire("Vui lòng đăng nhập để đăng ký!");
      return;
    }
    setIsWaiting(true);
    try {
      const result = await ticketService.registerWorkshop(id);
      if (result.status === 'FREE_SUCCESS') {
        Swal.fire('Đăng ký thành công! Vé đã được gửi tới email của bạn.');
        setIsRegistered(true);
      } else if (result.status === 'REQUIRE_PAYMENT') {
        setPaymentData(result);
        setIsModalOpen(true);
      } else if (result.status === 'PAY_AT_COUNTER') {
        Swal.fire(result.message || 'Hệ thống thanh toán bảo trì. Bạn đã được giữ chỗ, vui lòng thanh toán tại quầy!');
        setIsRegistered(true);
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      const errorMsg = error.response?.data?.error || error.message || "Đã có lỗi xảy ra, vui lòng thử lại!";
      Swal.fire(errorMsg);
    } finally {
      setIsWaiting(false);
    }
  };
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-blue-500 animate-spin" />
          <p className="text-gray-500 font-medium">Đang tải workshop...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError || !workshop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium text-lg">{loadError || 'Không tìm thấy workshop.'}</p>
        </div>
      </div>
    );
  }

  const isRegistrationExpired = workshop.registrationDeadline
    ? new Date().getTime() > new Date(workshop.registrationDeadline).getTime()
    : false;

  const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
  };

  // Dịch các định dạng danh sách, tiêu đề, xuống dòng
  const renderFormattedText = (text) => {
    if (!text) return 'Chưa có thông tin.';

    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Xử lý tiêu đề (### Heading) -> Chữ to, in đậm, màu xanh
      if (line.match(/^#{1,3}\s+/)) {
        const content = line.replace(/^#{1,3}\s+/, '');
        return <h4 key={index} className="text-xl font-bold text-blue-700 mt-5 mb-2">{content}</h4>;
      }

      // Xử lý Bullet point (- item hoặc * item) -> Thêm dấu chấm xanh
      if (line.match(/^[-*]\s+/)) {
        const content = line.replace(/^[-*]\s+/, '');
        return (
          <div key={index} className="flex items-start gap-2 mb-2 ml-2">
            <span className="text-blue-500 mt-0.5 font-bold">•</span>
            <span className="text-gray-700">{formatBoldText(content)}</span>
          </div>
        );
      }

      // Dòng trống
      if (line.trim() === '') return <div key={index} className="h-2"></div>;

      // Đoạn văn bình thường
      return <p key={index} className="text-gray-600 leading-relaxed mb-2">{formatBoldText(line)}</p>;
    });
  };

  // Dịch ký tự **text** -> In đậm, tô màu tím nhạt/xanh
  const formatBoldText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-indigo-700 bg-indigo-50 px-1 rounded">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cột trái: Thông tin chính */}
          <div className="lg:w-2/3 space-y-8">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <div className="h-64 md:h-96 relative">
                <img
                  src={workshop.coverImageUrl || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'}
                  alt="Workshop cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-4 py-1.5 font-bold rounded-full shadow-sm border ${workshop.price > 0
                      ? 'bg-blue-100 text-blue-700 border-blue-200'
                      : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}>
                    {formatPrice(workshop.price)}
                  </span>
                </div>
              </div>

              <div className="p-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                  {workshop.title}
                </h1>

                <div className="flex flex-wrap gap-6 text-gray-600 mb-8 pb-8 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-medium">Diễn giả</p>
                      <p className="font-semibold text-gray-900">{workshop.speaker || '---'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-medium">Ngày tổ chức</p>
                      <p className="font-semibold text-gray-900">{formatDate(workshop.eventDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-medium">Thời gian</p>
                      <p className="font-semibold text-gray-900">{workshop.startTime || '---'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Nội dung chương trình</h3>
                  <div className="text-lg">
                    {renderFormattedText(workshop.description)}
                  </div>
                </div>

                {/* PDF download link */}
                {workshop.pdfUrl && (
                  <div className="mt-6">
                    <a
                      href={workshop.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-medium text-sm hover:bg-blue-100 transition-colors border border-blue-100"
                    >
                      <FileText size={18} />
                      Xem tài liệu PDF chi tiết
                    </a>
                  </div>
                )}

                <div className="mt-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Sơ đồ phòng</h3>
                  <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden group cursor-pointer">
                    <div className="text-center group-hover:scale-105 transition-transform">
                      <MapPin size={48} className="mx-auto text-blue-400 mb-3" />
                      <p className="font-semibold text-gray-600">{workshop.room || 'Chưa xác định'}</p>
                      <p className="text-sm text-gray-400">Click để xem bản đồ chi tiết</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: AI Summary & Đăng ký */}
          <div className="lg:w-1/3 space-y-6">
            {/* Khung AI Summary */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>

              <div className="relative bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-purple-500 animate-pulse" size={24} />
                    <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                      AI Summary
                    </h3>
                  </div>
                  {!workshop.aiSummary && (
                    <button
                      onClick={() => fetchAiSummary()}
                      disabled={aiLoading}
                      title="Tạo lại"
                      className="text-gray-400 hover:text-purple-500 transition-colors disabled:opacity-40"
                    >
                      <RefreshCw size={16} className={aiLoading ? 'animate-spin' : ''} />
                    </button>
                  )}
                </div>

                {aiLoading ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-3 bg-gray-100 rounded-full w-full"></div>
                    <div className="h-3 bg-gray-100 rounded-full w-5/6"></div>
                    <div className="h-3 bg-gray-100 rounded-full w-4/6"></div>
                    <div className="flex gap-2 mt-4">
                      <div className="h-6 w-20 bg-purple-50 rounded-md"></div>
                      <div className="h-6 w-16 bg-purple-50 rounded-md"></div>
                      <div className="h-6 w-24 bg-purple-50 rounded-md"></div>
                    </div>
                  </div>
                ) : aiError ? (
                  <div className="text-sm text-red-500 leading-relaxed">
                    <p>{aiError}</p>
                    <button
                      onClick={() => fetchAiSummary()}
                      className="mt-2 text-purple-600 font-semibold hover:underline"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-gray-600 text-sm leading-relaxed mb-4">
                      <span className="mb-2 block">🤖 <strong>AI Tóm tắt:</strong></span>
                      <div className="bg-white/50 rounded-lg p-2 border border-purple-50">
                        {renderFormattedText(aiSummary)}
                      </div>
                    </div>
                    {aiHashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {aiHashtags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-50 text-purple-600 text-xs font-semibold rounded-md"
                          >
                            #{tag.replace(/^#/, '')}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Thẻ hiển thị giá vé & Đăng ký */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              {workshop.registrationDeadline && (
                <div className="mb-6">
                  <CountdownTimer
                    targetDate={workshop.registrationDeadline}
                    title="Đóng đăng ký sau"
                    expiredMessage="Đã hết hạn đăng ký"
                  />
                </div>
              )}



              <h3 className="text-xl font-bold text-gray-900 mb-2 border-t border-gray-100 pt-6">Thông tin đăng ký</h3>
              <div className="flex justify-between items-end py-4 border-b border-gray-100 mb-6">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Giá vé</p>
                  <p className="text-3xl font-extrabold text-gray-900">{formatPrice(workshop.price)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 font-medium">Còn lại</p>
                  <p className={`text-lg font-bold ${
                    (workshop.totalSeats - (workshop.bookedSpots || 0)) <= 0 ? 'text-red-500' :
                    (workshop.totalSeats - (workshop.bookedSpots || 0)) <= 10 ? 'text-amber-500' :
                    'text-blue-600'
                  }`}>
                    {Math.max(0, (workshop.totalSeats || 0) - (workshop.bookedSpots || 0))} / {workshop.totalSeats || 0} chỗ
                  </p>
                </div>
              </div>

              <button
                onClick={handleRegisterClick}
                disabled={isWaiting || isRegistrationExpired || (workshop.bookedSpots >= workshop.totalSeats && !isRegistered)}
                className={`w-full text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-all transform flex items-center justify-center gap-2 ${
                  isWaiting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : isRegistered
                      ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                      : isRegistrationExpired
                        ? 'bg-gray-400 cursor-not-allowed'
                        : (workshop.bookedSpots >= workshop.totalSeats)
                          ? 'bg-red-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1'
                }`}
              >
                {isWaiting ? (
                  <><Loader2 size={24} className="animate-spin" /> Đang xử lý...</>
                ) : isRegistered ? (
                  <><CheckCircle2 size={24} /> Đã đăng ký — Xem vé</>
                ) : isRegistrationExpired ? (
                  'Hết thời hạn đăng ký'
                ) : (workshop.bookedSpots >= workshop.totalSeats) ? (
                  'Đã hết chỗ'
                ) : (
                  'Đăng ký ngay'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sửa lại đoạn này */}
      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workshopTitle={workshop.title}
        paymentData={paymentData}
        workshopId={id}
      />

      {/* Waiting Queue Overlay */}
      {isWaiting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 animate-in zoom-in duration-300">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Đang xếp hàng...</h3>
            <p className="text-gray-500 text-center text-sm mb-6">
              Hệ thống đang xử lý lượng lớn yêu cầu đăng ký. Vui lòng không làm mới trang (F5).
            </p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden relative">
              <div className="bg-blue-600 h-1.5 rounded-full absolute top-0 left-0 animate-[progress_2.5s_ease-in-out_forwards]"></div>
            </div>
            <style dangerouslySetInnerHTML={{
              __html: `
              @keyframes progress {
                0% { width: 0%; }
                50% { width: 70%; }
                100% { width: 100%; }
              }
            `}} />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopDetail;
