import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="relative inline-block mb-8">
          <h1 className="text-9xl font-black text-gray-200">404</h1>
          <div className="absolute inset-0 flex items-center justify-center animate-bounce">
            <AlertTriangle size={64} className="text-amber-500 drop-shadow-md" />
          </div>
        </div>
        
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
          Úi, nhầm phòng rồi!
        </h2>
        <p className="text-lg text-gray-600 mb-10 leading-relaxed">
          Workshop này có vẻ như không tồn tại, hoặc diễn giả đã đi lạc đâu đó rồi. Đừng lo, hãy quay lại sảnh chính để tìm các sự kiện khác nhé.
        </p>
        
        <Link 
          to="/" 
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1"
        >
          <Home size={24} />
          Quay về Trang chủ
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
