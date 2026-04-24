import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, ChevronRight, ChevronLeft } from 'lucide-react';

const openWorkshops = [
  {
    id: 1,
    title: "Kỹ năng phỏng vấn xin việc cho sinh viên IT",
    speaker: "Nguyễn Văn A - HR Manager TechCorp",
    date: "25/04/2026",
    time: "08:00 - 11:30",
    room: "Hội trường lớn",
    type: "Miễn phí",
    totalSpots: 100,
    bookedSpots: 85,
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    title: "Định hướng nghề nghiệp Data Science 2026",
    speaker: "Trần Thị B - Senior Data Scientist",
    date: "26/04/2026",
    time: "13:30 - 16:30",
    room: "Phòng A102",
    type: "Có phí",
    price: "50.000đ",
    totalSpots: 50,
    bookedSpots: 48,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];

const upcomingWorkshops = [
  {
    id: 3,
    title: "Xây dựng thương hiệu cá nhân trên LinkedIn",
    speaker: "Lê Văn C - Marketing Director",
    date: "15/05/2026",
    time: "09:00 - 11:00",
    room: "Phòng B201",
    type: "Miễn phí",
    totalSpots: 80,
    bookedSpots: 0,
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    title: "Tương lai của Trí tuệ Nhân tạo (AI) trong Y tế",
    speaker: "Phạm Văn D - AI Researcher",
    date: "20/05/2026",
    time: "14:00 - 16:00",
    room: "Hội trường B",
    type: "Miễn phí",
    totalSpots: 150,
    bookedSpots: 0,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];

const heroSlides = [
  {
    id: 1,
    badge: "SỰ KIỆN NỔI BẬT",
    title: "Tuần lễ kỹ năng và",
    highlight: "nghề nghiệp",
    desc: "Hành trang vững chắc cho tương lai. Khám phá các workshop chuyên sâu từ những chuyên gia hàng đầu trong ngành để định hình sự nghiệp của bạn.",
    bgImage: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
  },
  {
    id: 2,
    badge: "WORKSHOP ĐẶC BIỆT",
    title: "Khám phá tiềm năng",
    highlight: "Công nghệ AI",
    desc: "Trải nghiệm sức mạnh của Trí tuệ Nhân tạo trong việc tự động hóa và nâng cao hiệu suất làm việc của bạn.",
    bgImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
  },
  {
    id: 3,
    badge: "KẾT NỐI",
    title: "Gặp gỡ nhà tuyển dụng",
    highlight: "hàng đầu",
    desc: "Cơ hội giao lưu trực tiếp và phỏng vấn với các tập đoàn công nghệ lớn nhất tại Việt Nam.",
    bgImage: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
  }
];

const StudentHome = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));

  const scrollToWorkshops = () => {
    document.getElementById('workshop-list').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 overflow-hidden relative">
      {/* Background Animated Blobs */}
      <div className="absolute top-0 left-0 w-full h-screen overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section (Carousel) */}
      <section className="relative h-[600px] text-white overflow-hidden rounded-b-[3rem] shadow-2xl mx-2 md:mx-4 mt-2">
        {heroSlides.map((slide, index) => (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <div className="absolute inset-0 z-0 opacity-40 bg-cover bg-center transition-transform duration-[10000ms] hover:scale-105" style={{ backgroundImage: `url(${slide.bgImage})` }}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent z-0"></div>
            
            <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 h-full flex flex-col justify-center">
              <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                <span className="inline-block py-1.5 px-4 rounded-full glass-dark text-blue-200 text-sm font-bold tracking-widest mb-6 uppercase border border-white/20 animate-float">
                  {slide.badge}
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                  {slide.title} <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 drop-shadow-lg">{slide.highlight}</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-xl font-light">
                  {slide.desc}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={scrollToWorkshops}
                    className="relative group overflow-hidden bg-white text-blue-900 px-8 py-4 rounded-full font-bold text-lg hover:text-white transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transform hover:-translate-y-1 flex items-center justify-center gap-2"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></span>
                    <span className="relative z-10 flex items-center gap-2">Khám phá ngay <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform"/></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Controls */}
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center items-center gap-4">
          <button onClick={prevSlide} className="w-10 h-10 rounded-full glass-dark flex items-center justify-center hover:bg-white/20 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-2">
            {heroSlides.map((_, index) => (
              <button 
                key={index} 
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-blue-500' : 'w-2 bg-white/30 hover:bg-white/50'}`}
              ></button>
            ))}
          </div>
          <button onClick={nextSlide} className="w-10 h-10 rounded-full glass-dark flex items-center justify-center hover:bg-white/20 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* Helper function to render a card */}
      {(() => {
        const renderWorkshopCard = (workshop) => {
          const spotsLeft = workshop.totalSpots - workshop.bookedSpots;
          const progressPercentage = (workshop.bookedSpots / workshop.totalSpots) * 100;
          const isAlmostFull = spotsLeft > 0 && spotsLeft <= (workshop.totalSpots * 0.2);
          const isFull = spotsLeft === 0;

          return (
            <Link 
              to={`/workshop/${workshop.id}`} 
              key={workshop.id} 
              className="glass rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 flex flex-col h-full group cursor-pointer border border-white/50 hover:border-blue-200 relative"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              {/* Card Header with Image */}
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={workshop.image} 
                  alt={workshop.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  <span className={`px-4 py-1.5 text-xs font-bold rounded-full shadow-lg backdrop-blur-md ${
                    workshop.type === 'Miễn phí' 
                      ? 'bg-emerald-500/80 text-white border border-emerald-400/50' 
                      : 'bg-amber-500/80 text-white border border-amber-400/50'
                  }`}>
                    {workshop.type}
                  </span>
                </div>
                <h3 className="absolute bottom-4 left-4 right-4 text-xl font-bold text-white line-clamp-2 leading-snug drop-shadow-md group-hover:text-blue-300 transition-colors">
                  {workshop.title}
                </h3>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-grow flex flex-col relative z-10 bg-white/40">
                <div className="space-y-3 text-sm text-gray-700 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <User size={14} />
                    </div>
                    <span className="font-medium">{workshop.speaker}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                      <Calendar size={14} />
                    </div>
                    <span>{workshop.date} • {workshop.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                      <MapPin size={14} />
                    </div>
                    <span className="truncate">{workshop.room}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-200/50">
                  <div className="mb-5">
                    <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wider">
                      <span className="text-gray-500">Tình trạng vé</span>
                      <span className={isFull ? "text-gray-500" : (isAlmostFull ? "text-red-500" : "text-blue-600")}>
                        {isFull ? "Đã bán hết" : `${workshop.bookedSpots}/${workshop.totalSpots} vé`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200/50 rounded-full h-2.5 overflow-hidden backdrop-blur-sm">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden ${isFull ? 'bg-gray-400' : (isAlmostFull ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-blue-400')}`}
                        style={{ width: `${progressPercentage}%` }}
                      >
                        {!isFull && <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_ease-in-out_infinite]"></div>}
                      </div>
                    </div>
                  </div>

                  <div className="w-full py-3 bg-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 text-blue-600 hover:text-white border border-blue-100 hover:border-transparent rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
                    Xem chi tiết <ChevronRight size={18} className="transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          );
        };

        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 z-10 relative">
            {/* Open Workshops Section */}
            <section id="workshop-list" className="scroll-mt-24 mb-20">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 mb-2">Workshop Đang Mở</h2>
                  <p className="text-gray-500 text-lg">Nhanh tay đăng ký trước khi hết vé</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {openWorkshops.map(renderWorkshopCard)}
              </div>
            </section>

            {/* Upcoming Workshops Section */}
            <section className="mb-20">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 mb-2">Sự Kiện Sắp Tới</h2>
                  <p className="text-gray-500 text-lg">Lên lịch sẵn sàng cho các sự kiện hấp dẫn</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingWorkshops.map(renderWorkshopCard)}
              </div>
            </section>
          </div>
        );
      })()}
    </div>
  );
};

export default StudentHome;
