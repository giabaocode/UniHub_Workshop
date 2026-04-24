import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, ChevronRight } from 'lucide-react';

const workshops = [
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
  },
  {
    id: 3,
    title: "Xây dựng thương hiệu cá nhân trên LinkedIn",
    speaker: "Lê Văn C - Marketing Director",
    date: "27/04/2026",
    time: "09:00 - 11:00",
    room: "Phòng B201",
    type: "Miễn phí",
    totalSpots: 80,
    bookedSpots: 30,
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];

const StudentHome = () => {
  const scrollToWorkshops = () => {
    document.getElementById('workshop-list').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <section className="relative bg-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-transparent z-0"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-24 md:py-32">
          <div className="max-w-2xl">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-800 text-blue-200 text-sm font-semibold tracking-wider mb-4 border border-blue-700 shadow-sm">
              SỰ KIỆN NỔI BẬT
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Tuần lễ kỹ năng và <br/><span className="text-blue-400">nghề nghiệp</span> Đại học A
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-10 leading-relaxed max-w-xl">
              Hành trang vững chắc cho tương lai. Khám phá các workshop chuyên sâu từ những chuyên gia hàng đầu trong ngành để định hình sự nghiệp của bạn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={scrollToWorkshops}
                className="bg-white text-blue-900 px-8 py-3.5 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Khám phá ngay <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Workshop List Section */}
      <section id="workshop-list" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 scroll-mt-24">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Lịch Workshop sắp tới</h2>
            <p className="text-gray-500 mt-2">Đăng ký tham gia các sự kiện để tích lũy kiến thức</p>
          </div>
          <a href="#" className="hidden sm:flex text-blue-600 font-medium hover:text-blue-800 items-center gap-1 group">
            Xem tất cả <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workshops.map(workshop => {
            const spotsLeft = workshop.totalSpots - workshop.bookedSpots;
            const progressPercentage = (workshop.bookedSpots / workshop.totalSpots) * 100;
            const isAlmostFull = spotsLeft <= (workshop.totalSpots * 0.2); // Less than 20% left

            return (
              <Link 
                to={`/workshop/${workshop.id}`} 
                key={workshop.id} 
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 flex flex-col h-full group cursor-pointer block"
              >
                {/* Card Header with Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={workshop.image} 
                    alt={workshop.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 z-10">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                      workshop.type === 'Miễn phí' 
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {workshop.type}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {workshop.title}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="truncate">{workshop.speaker}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span>{workshop.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <span>{workshop.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="truncate">{workshop.room}</span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs font-medium mb-1.5">
                        <span className="text-gray-500">Tiến độ đăng ký</span>
                        <span className={isAlmostFull ? "text-red-500 font-bold" : "text-blue-600"}>
                          {workshop.bookedSpots}/{workshop.totalSpots} chỗ
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ${isAlmostFull ? 'bg-red-500' : 'bg-blue-500'}`}
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      {isAlmostFull && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                          Sắp hết chỗ!
                        </p>
                      )}
                    </div>

                    <div className="w-full py-2.5 bg-gray-50 group-hover:bg-blue-600 text-blue-600 border border-blue-100 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 group-hover:text-white">
                      Xem chi tiết <ChevronRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        
        <div className="mt-8 flex justify-center sm:hidden">
          <button className="text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1">
            Xem tất cả sự kiện <ChevronRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default StudentHome;
