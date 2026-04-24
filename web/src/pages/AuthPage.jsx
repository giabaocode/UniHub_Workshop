import React, { useState, useEffect, useContext } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Home, ArrowLeft, KeyRound } from 'lucide-react';
import { AuthContext } from '../context/authContext';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isOtp, setIsOtp] = useState(false);

  const { login, register } = useContext(AuthContext);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/');
      } else {
        if (password !== confirmPassword) {
          setError('Mật khẩu xác nhận không khớp');
          setIsLoading(false);
          return;
        }
        await register(fullName, email, password);
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

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
            {isOtp ? 'Xác thực Email' : (isForgotPassword ? 'Khôi phục mật khẩu' : (isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'))}
          </h2>
          <p className="text-gray-500 mt-2">
            {isOtp ? 'Vui lòng nhập mã OTP 6 số đã được gửi tới email của bạn' : (isForgotPassword ? 'Nhập email để nhận link đặt lại mật khẩu' : (isLogin ? 'Vui lòng đăng nhập để tiếp tục' : 'Tham gia cộng đồng UniHub ngay hôm nay'))}
          </p>
        </div>

        {isOtp ? (
          <form className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mã OTP</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound className="text-gray-400" size={18} />
                </div>
                <input 
                  type="text" 
                  maxLength={6}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50/50 focus:bg-white text-center text-xl font-bold tracking-[0.5em]"
                  placeholder="------"
                />
              </div>
              <div className="text-right mt-2">
                <button type="button" className="text-sm font-medium text-blue-600 hover:text-blue-700">Gửi lại mã OTP</button>
              </div>
            </div>
            
            <button 
              type="button" 
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 text-white font-bold text-lg py-3.5 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 mt-2 flex items-center justify-center gap-2"
            >
              Xác thực và Tạo tài khoản
              <ArrowRight size={20} />
            </button>
            
            <div className="mt-6 text-center">
              <button 
                type="button"
                onClick={() => setIsOtp(false)} 
                className="font-medium text-gray-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft size={16} />
                Quay lại Đăng ký
              </button>
            </div>
          </form>
        ) : isForgotPassword ? (
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
          <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-500">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium border border-red-100">
                {error}
              </div>
            )}
            
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và Tên</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="text-gray-400" size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isLogin}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50/50 focus:bg-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-bold text-lg py-3.5 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Tạo tài khoản')}
              {!isLoading && <ArrowRight size={20} />}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">Hoặc</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                onClick={() => navigate('/')}
                className="w-full bg-white text-gray-700 font-bold text-sm py-3 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>

              <button 
                type="button" 
                onClick={() => navigate('/')}
                className="w-full bg-[#24292F] text-white font-bold text-sm py-3 rounded-xl border border-[#24292F] shadow-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                GitHub
              </button>
            </div>
          </form>
        )}

        {!isForgotPassword && !isOtp && (
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
