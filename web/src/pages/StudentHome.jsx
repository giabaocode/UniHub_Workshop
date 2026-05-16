import React, { useState, useEffect } from 'react';
import { Loader2, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { workshopService } from '../services/workshopService';

// Import các Component con vừa tách
import HeroSlider from '../components/HeroSlider';
import WorkshopCard from '../components/WorkshopCard';

const StudentHome = () => {
  const [workshops, setWorkshops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE BỘ LỌC VÀ PHÂN TRANG ---
  const [filter, setFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    let isMounted = true;

    const fetchWorkshops = async ({ showLoading = false } = {}) => {
      if (showLoading) {
        setIsLoading(true);
      }

      try {
        const data = await workshopService.getAllWorkshops();
        if (isMounted) {
          setWorkshops(data);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách workshop:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchWorkshops({ showLoading: true });

    const seatStream = workshopService.createSeatUpdateStream({
      onSeatUpdate: (seatUpdate) => {
        setWorkshops((prev) => prev.map((workshop) => (
          Number(workshop.id) === Number(seatUpdate.workshopId)
            ? {
                ...workshop,
                totalSeats: seatUpdate.totalSeats,
                bookedSpots: seatUpdate.bookedSpots,
              }
            : workshop
        )));
      },
      onRefresh: () => fetchWorkshops(),
      onError: (error) => console.error("Lỗi SSE cập nhật ghế:", error),
    });

    return () => {
      isMounted = false;
      seatStream.close();
    };
  }, []);

  // Reset về trang 1 khi đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const scrollToWorkshops = () => {
    document.getElementById('workshop-list').scrollIntoView({ behavior: 'smooth' });
  };

  // --- BƯỚC 1: LỌC BỎ SỰ KIỆN QUÁ KHỨ VÀ THEO GIÁ TIỀN ---
  const filteredWorkshops = workshops.filter(workshop => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (workshop.eventDate < todayStr) return false;

    if (workshop.eventDate === todayStr && workshop.startTime && workshop.startTime.substring(0, 5) < currentTimeStr) {
      return false;
    }

    if (filter === 'FREE') return workshop.price === 0 || workshop.price === null;
    if (filter === 'PAID') return workshop.price > 0;

    return true;
  });

  // --- BƯỚC 2: TỰ ĐỘNG SẮP XẾP TĂNG DẦN (GẦN NHẤT LÊN ĐẦU) ---
  const sortedWorkshops = [...filteredWorkshops].sort((a, b) => {
    // Gộp ngày và giờ (Nếu không có giờ thì cho mặc định là 00:00:00)
    const dateTimeA = new Date(`${a.eventDate}T${a.startTime || '00:00:00'}`);
    const dateTimeB = new Date(`${b.eventDate}T${b.startTime || '00:00:00'}`);

    // Phép trừ này sẽ đưa sự kiện có thời gian nhỏ hơn (gần hiện tại hơn) lên trước
    return dateTimeA - dateTimeB;
  });

  // --- BƯỚC 3: CẮT DỮ LIỆU ĐỂ PHÂN TRANG (Lấy từ mảng đã Sort) ---
  const totalPages = Math.ceil(sortedWorkshops.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentWorkshops = sortedWorkshops.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 overflow-hidden relative">
      {/* Background Animated Blobs */}
      <div className="absolute top-0 left-0 w-full h-screen overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <HeroSlider onExploreClick={scrollToWorkshops} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 z-10 relative">
        <section id="workshop-list" className="scroll-mt-24 mb-20">

          {/* HEADER & FILTER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 mb-2">Danh sách Workshop</h2>
              <p className="text-gray-500 text-lg">Khám phá và đăng ký ngay các sự kiện sắp diễn ra</p>
            </div>

            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200">
              <div className="pl-3 pr-2 text-gray-400 hidden sm:block"><Filter size={18} /></div>
              <button onClick={() => setFilter('ALL')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'ALL' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>Tất cả</button>
              <button onClick={() => setFilter('FREE')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'FREE' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>Miễn phí</button>
              <button onClick={() => setFilter('PAID')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'PAID' ? 'bg-amber-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>Có phí</button>
            </div>
          </div>

          {/* HIỂN THỊ LOADING HOẶC DỮ LIỆU */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-blue-500">
              <Loader2 className="animate-spin w-12 h-12 mb-4" />
              <p className="font-medium text-gray-500">Đang tải dữ liệu từ hệ thống...</p>
            </div>
          ) : currentWorkshops.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-lg">Hiện tại chưa có sự kiện nào sắp diễn ra.</p>
            </div>
          ) : (
            <>
              {/* Render danh sách WorkshopCard */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentWorkshops.map(workshop => (
                  <WorkshopCard key={workshop.id} workshop={workshop} />
                ))}
              </div>

              {/* PHÂN TRANG */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-12 gap-2">
                  <button onClick={() => {
                    setCurrentPage(prev => Math.max(prev - 1, 1));
                    scrollToWorkshops();
                  }} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button key={i} onClick={() => { setCurrentPage(i + 1); scrollToWorkshops(); }} className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all shadow-sm ${currentPage === i + 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); scrollToWorkshops(); }} disabled={currentPage === totalPages} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default StudentHome;
