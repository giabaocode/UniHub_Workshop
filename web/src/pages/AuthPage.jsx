import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Home, ArrowLeft } from 'lucide-react';

const AuthPage = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Allow passing state from Link to automatically switch tabs (e.g. from Header register button)
  useEffect(() => {
    if (location.state?.isRegister) {
      setIsLogin(false);
      setIsForgotPassword(false);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-400/20 rounded-full blur-3xl mix-blend-multiply"></div>

      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
        <Home size={18} />
        <span className="font-medium text-sm">Quay về trang chủ</span>
      </Link>

      <div className="bg-white/80 backdrop-blur-xl w-full max-w-md rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 p-8 relative z-10 overflow-hidden transition-all duration-500">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-blue-500/30">
            U
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isForgotPassword ? 'Khôi phục mật khẩu' : (isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới')}
          </h2>
          <p className="text-gray-500 mt-2">
            {isForgotPassword ? 'Nhập email để nhận link đặt lại mật khẩu' : (isLogin ? 'Vui lòng đăng nhập để tiếp tục' : 'Tham gia cộng đồng UniHub ngay hôm nay')}
          </p>
        </div>

        {isForgotPassword ? (
          <form className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={18} />
                </div>
                <input 
                  type="email" 
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50/50 focus:bg-white"
                  placeholder="sv@student.edu.vn"
                />
              </div>
            </div>
            
            <button 
              type="button" 
              className="w-full bg-blue-600 text-white font-bold text-lg py-3.5 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 mt-2"
            >
              Gửi link khôi phục
            </button>
            
            <div className="mt-6 text-center">
              <button 
                type="button"
                onClick={() => setIsForgotPassword(false)} 
                className="font-medium text-gray-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft size={16} />
                Quay lại Đăng nhập
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-500">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và Tên</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="text-gray-400" size={18} />
                  </div>
                  <input 
                    type="text" 
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50/50 focus:bg-white"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={18} />
                </div>
                <input 
                  type="email" 
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50/50 focus:bg-white"
                  placeholder="sv@student.edu.vn"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">Mật khẩu</label>
                {isLogin && (
                  <button 
                    type="button"
                    onClick={() => setIsForgotPassword(true)} 
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={18} />
                </div>
                <input 
                  type="password" 
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50/50 focus:bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Xác nhận mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" size={18} />
                  </div>
                  <input 
                    type="password" 
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50/50 focus:bg-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button 
              type="button" 
              className="w-full bg-blue-600 text-white font-bold text-lg py-3.5 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-2"
            >
              {isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
              <ArrowRight size={20} />
            </button>
          </form>
        )}

        {!isForgotPassword && (
          <div className="mt-8 text-center text-sm">
            {isLogin ? (
              <p className="text-gray-600">
                Chưa có tài khoản?{' '}
                <button onClick={() => setIsLogin(false)} className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Đăng ký ngay
                </button>
              </p>
            ) : (
              <p className="text-gray-600">
                Đã có tài khoản?{' '}
                <button onClick={() => setIsLogin(true)} className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Đăng nhập
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
