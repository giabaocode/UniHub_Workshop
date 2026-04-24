import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const heroSlides = [
  {
    id: 1, badge: "SỰ KIỆN NỔI BẬT", title: "Tuần lễ kỹ năng và", highlight: "nghề nghiệp",
    desc: "Hành trang vững chắc cho tương lai. Khám phá các workshop chuyên sâu từ những chuyên gia hàng đầu trong ngành để định hình sự nghiệp của bạn.",
    bgImage: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
  },
  {
    id: 2, badge: "WORKSHOP ĐẶC BIỆT", title: "Khám phá tiềm năng", highlight: "Công nghệ AI",
    desc: "Trải nghiệm sức mạnh của Trí tuệ Nhân tạo trong việc tự động hóa và nâng cao hiệu suất làm việc của bạn.",
    bgImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
  },
  {
    id: 3, badge: "KẾT NỐI", title: "Gặp gỡ nhà tuyển dụng", highlight: "hàng đầu",
    desc: "Cơ hội giao lưu trực tiếp và phỏng vấn với các tập đoàn công nghệ lớn nhất tại Việt Nam.",
    bgImage: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
  }
];

const HeroSlider = ({ onExploreClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));

  return (
    <section className="relative h-[600px] text-white overflow-hidden rounded-b-[3rem] shadow-2xl mx-2 md:mx-4 mt-2">
      {heroSlides.map((slide, index) => (
        <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <div className="absolute inset-0 z-0 opacity-40 bg-cover bg-center transition-transform duration-[10000ms] hover:scale-105" style={{ backgroundImage: `url(${slide.bgImage})` }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent z-0"></div>
          
          <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 h-full flex flex-col justify-center">
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
              <span className="inline-block py-1.5 px-4 rounded-full glass-dark text-blue-200 text-sm font-bold tracking-widest mb-6 uppercase border border-white/20 animate-float">{slide.badge}</span>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                {slide.title} <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 drop-shadow-lg">{slide.highlight}</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-xl font-light">{slide.desc}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={onExploreClick} className="relative group overflow-hidden bg-white text-blue-900 px-8 py-4 rounded-full font-bold text-lg hover:text-white transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transform hover:-translate-y-1 flex items-center justify-center gap-2">
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></span>
                  <span className="relative z-10 flex items-center gap-2">Khám phá ngay <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform"/></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center items-center gap-4">
        <button onClick={prevSlide} className="w-10 h-10 rounded-full glass-dark flex items-center justify-center hover:bg-white/20 transition-colors"><ChevronLeft size={20} /></button>
        <div className="flex gap-2">
          {heroSlides.map((_, index) => (
            <button key={index} onClick={() => setCurrentSlide(index)} className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-blue-500' : 'w-2 bg-white/30 hover:bg-white/50'}`}></button>
          ))}
        </div>
        <button onClick={nextSlide} className="w-10 h-10 rounded-full glass-dark flex items-center justify-center hover:bg-white/20 transition-colors"><ChevronRight size={20} /></button>
      </div>
    </section>
  );
};

export default HeroSlider;