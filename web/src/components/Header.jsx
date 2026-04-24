import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { LayoutDashboard, Ticket, Calendar, LogOut } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Kiểm tra xem user có phải là Admin không (giả sử role là 'ADMIN' hoặc 'ROLE_ADMIN')
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN';

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              U
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">UniHub</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${location.pathname === '/'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                  }`}
              >
                <Calendar size={18} />
                Lịch Workshop
              </Link>

              {user && (
                <Link
                  to="/my-tickets"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${location.pathname === '/my-tickets'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                >
                  <Ticket size={18} />
                  Vé của tôi
                </Link>
              )}

              {/* Nếu là Admin -> Hiện thêm nút quản lý */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${location.pathname.startsWith('/admin')
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                >
                  <LayoutDashboard size={18} />
                  Quản lý
                </Link>
              )}
            </nav>

            {user ? (
              <div className="flex items-center gap-3 md:border-l md:border-gray-100 md:pl-6">
                <Link to="/profile" className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[2px] group-hover:rotate-12 transition-all shrink-0 shadow-md">
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-gray-50">
                      {/* LOGIC AVATAR: Cloudinary -> OAuth Link -> UI-Avatar */}
                      <img
                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=fff&color=3b82f6&bold=true`}
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=3b82f6&color=fff`; }}
                      />
                    </div>
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {user.fullName}
                    </p>
                    <p className="text-[11px] font-medium text-gray-400 line-clamp-1 uppercase tracking-wider">
                      {user.role === 'ADMIN' ? 'Quản trị viên' : 'Sinh viên'}
                    </p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Đăng xuất"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:border-l md:border-gray-100 md:pl-6">
                <Link
                  to="/login"
                  className="hidden sm:block text-sm font-bold text-gray-600 hover:text-blue-600 px-4 py-2 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/login"
                  state={{ isRegister: true }}
                  className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all active:scale-95"
                >
                  Tham gia ngay
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;