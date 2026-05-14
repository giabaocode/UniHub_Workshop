import React, { useState, useEffect, useContext } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Users, Settings, LogOut, Search, Bell, QrCode } from 'lucide-react';
import { AuthContext } from '../context/authContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    // Chỉ kết nối SSE nếu là ADMIN
    if (user?.role?.trim() !== 'ADMIN') return;

    // Kết nối tới luồng SSE của Backend
    const eventSource = new EventSource('http://localhost:8080/api/notifications/stream', { withCredentials: true });

    eventSource.onopen = () => console.log("SSE Connected");

    // Lắng nghe sự kiện "NEW_REGISTRATION"
    eventSource.addEventListener('NEW_REGISTRATION', (event) => {
      const data = JSON.parse(event.data);
      const newNotif = {
        id: Date.now(),
        message: data.message,
        read: false,
        time: new Date().toLocaleTimeString()
      };
      
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    eventSource.onerror = (err) => {
      console.error("SSE Error:", err);
      eventSource.close();
    };

    return () => eventSource.close();
  }, [user]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Nếu không có user hoặc không phải ADMIN/STAFF thì đuổi về login
  if (!user) return <Navigate to="/login" replace />;

  const isAdmin = user?.role?.trim() === 'ADMIN';
  const isStaff = user?.role?.trim() === 'STAFF';

  // STAFF chỉ được vào trang attendees, không được vào trang admin khác
  if (isStaff) {
    return <Navigate to="/checkin" replace />;
  }

  // Menu chỉ hiện cho ADMIN
  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Tạo Workshop mới', path: '/admin/create', icon: <CalendarDays size={20} /> },
    { name: 'Quản lý Nhân sự', path: '/admin/staff', icon: <Users size={20} /> },
    { name: 'Cài đặt', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar - Cột trái 20% */}
      <aside className="w-1/5 bg-slate-900 text-white flex flex-col transition-all duration-300 shadow-xl z-20">
        <div className="p-6 flex items-center justify-center border-b border-slate-800">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">UniHub Admin</h1>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path) && item.path !== '#');
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            // DÙNG HÀM LOGOUT Ở ĐÂY
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content - Cột phải */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shadow-sm shrink-0 z-10">
          <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all w-96">
            <Search className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="bg-transparent border-none outline-none ml-3 w-full text-sm placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-6 relative">
            {/* Notification Bell (Giữ nguyên code của bạn) */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors focus:outline-none"
              >
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-900">Thông báo</h3>
                    <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Đánh dấu đã đọc</button>
                  </div>
                  
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-sm text-gray-500 flex flex-col items-center">
                        <Bell size={24} className="text-gray-300 mb-2" />
                        Chưa có thông báo nào
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className={`p-4 border-b border-gray-50 transition-colors ${!notif.read ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                          <div className="flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-lg">🎉</span>
                            </div>
                            <div>
                              <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{notif.message}</p>
                              <span className="text-xs text-gray-400 mt-1 block">{notif.time}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3 text-center border-t border-gray-100 bg-gray-50/50">
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Xem tất cả</button>
                  </div>
                </div>
              )}
            </div>

            {/* HIỂN THỊ THÔNG TIN USER ĐỘNG */}
            <Link to="/admin/profile" className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[2px] group-hover:scale-105 transition-transform">
                <img
                  // Dùng ảnh của user, nếu chưa có thì dùng ảnh mặc định tạo từ tên
                  src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.fullName || 'Admin'}&background=fff&color=3b82f6`}
                  alt="Admin Avatar"
                  className="w-full h-full rounded-full object-cover border-2 border-white bg-white"
                />
              </div>
              <div className="hidden md:block text-left">
                {/* Lấy tên thật từ Context */}
                <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1 max-w-[150px]">
                  {user?.fullName || 'Admin User'}
                </p>
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  {user?.role?.trim() === 'ADMIN' ? 'Quản trị viên' : 'Nhân sự'}
                </p>
              </div>
            </Link>

          </div>
        </header>

        {/* Dynamic Content Outlet */}
        <div className="flex-1 overflow-auto p-8 bg-gray-50/50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;