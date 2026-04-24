import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              U
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">UniHub Workshop</span>
          </Link>
          
          <div className="flex items-center space-x-8">
            <nav className="hidden md:flex space-x-8">
              <Link 
                to="/" 
                className={`font-medium transition-all duration-200 border-b-2 py-1 ${
                  location.pathname === '/' 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-200'
                }`}
              >
                Lịch Workshop
              </Link>
              <Link 
                to="/my-tickets" 
                className={`font-medium transition-all duration-200 border-b-2 py-1 ${
                  location.pathname === '/my-tickets' 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-200'
                }`}
              >
                Vé của tôi
              </Link>
            </nav>
            
            {/* Đã đăng nhập (Mock) */}
            <Link to="/profile" className="flex items-center gap-3 cursor-pointer group md:border-l md:border-gray-200 md:pl-8">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[2px] group-hover:scale-105 transition-transform shrink-0">
                <img 
                  src="https://ui-avatars.com/api/?name=Student&background=fff&color=3b82f6" 
                  alt="User Avatar" 
                  className="w-full h-full rounded-full object-cover border-2 border-white"
                />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Nguyễn Văn A</p>
                <p className="text-xs text-gray-500">sv.nguyenvana@unihub.edu.vn</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
