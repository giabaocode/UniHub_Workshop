import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { LayoutDashboard, Ticket, Calendar, LogOut, Menu, X, QrCode } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isAdmin = user?.role?.trim() === 'ADMIN' || user?.role === 'ROLE_ADMIN';
  const isStaff = user?.role?.trim() === 'STAFF';

  const navLinks = [
    { to: '/', label: 'Lịch Workshop', icon: <Calendar size={18} />, show: true },
    { to: '/my-tickets', label: 'Vé của tôi', icon: <Ticket size={18} />, show: !!user && !isAdmin && !isStaff },
    { to: '/admin', label: 'Quản lý', icon: <LayoutDashboard size={18} />, show: isAdmin },
    { to: '/checkin', label: 'Check-in', icon: <QrCode size={18} />, show: isStaff },
  ].filter(l => l.show);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2.5 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              U
            </div>
            <span className="font-bold text-lg sm:text-xl text-gray-900 tracking-tight">UniHub</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            <nav className="flex items-center space-x-1">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to))
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                  }`}>
                  {link.icon}{link.label}
                </Link>
              ))}
            </nav>

            {user ? (
              <div className="flex items-center gap-3 border-l border-gray-100 pl-6">
                <Link to={isAdmin ? '/admin/profile' : '/profile'} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[2px] group-hover:rotate-12 transition-all shrink-0 shadow-md">
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-gray-50">
                      <img
                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=fff&color=3b82f6&bold=true`}
                        alt="Avatar" className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=3b82f6&color=fff`; }}
                      />
                    </div>
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{user.fullName}</p>
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                      {isAdmin ? 'Quản trị viên' : isStaff ? 'Nhân sự' : 'Sinh viên'}
                    </p>
                  </div>
                </Link>
                <button onClick={handleLogout} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Đăng xuất">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-gray-100 pl-6">
                <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-blue-600 px-4 py-2 transition-colors">Đăng nhập</Link>
                <Link to="/login" state={{ isRegister: true }} className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95">Tham gia ngay</Link>
              </div>
            )}
          </div>

          {/* Mobile: Avatar + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-blue-200 shrink-0">
                <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'U')}&background=3b82f6&color=fff&bold=true`}
                  alt="Avatar" className="w-full h-full object-cover" />
              </div>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  location.pathname === link.to
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}>
                {link.icon}{link.label}
              </Link>
            ))}
          </div>
          <div className="px-4 pb-4 border-t border-gray-100 pt-3">
            {user ? (
              <div className="space-y-2">
                <div className="px-4 py-2">
                  <p className="font-bold text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-all">
                  <LogOut size={18} /> Đăng xuất
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="block w-full text-center py-3 font-bold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-all">
                  Đăng nhập
                </Link>
                <Link to="/login" state={{ isRegister: true }} onClick={() => setMenuOpen(false)}
                  className="block w-full text-center py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all">
                  Tham gia ngay
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;