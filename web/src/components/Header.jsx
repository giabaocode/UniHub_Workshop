import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
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
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Lịch Workshop</Link>
            <Link to="/my-tickets" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Vé của tôi</Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors hidden md:block">
              Đăng nhập
            </Link>
            <Link to="/login" state={{ isRegister: true }} className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 inline-block">
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
