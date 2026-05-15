import React, { useState, useEffect, useRef, useContext } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { AuthContext } from '../context/authContext';
import Swal from 'sweetalert2';

const NotificationBell = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user || !user.token) return;

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications/my`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
          setUnreadCount(data.filter(n => !n.read).length);
        }
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };

    fetchNotifications();

    // SSE cho push notification
    // Dùng URL tuyệt đối nếu có thể hoặc URL bắt đầu bằng /api (đã fix bỏ dư thừa /api)
    const sseUrl = `${import.meta.env.VITE_API_BASE_URL}/notifications/stream-user?token=${user.token}`;
    const eventSource = new EventSource(sseUrl);
    
    eventSource.addEventListener('NEW_NOTIFICATION', (event) => {
      const newNotif = JSON.parse(event.data);
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Toast pop-up báo notification mới
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        icon: 'info',
        title: newNotif.title,
        text: newNotif.message,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
    });

    return () => {
      eventSource.close();
    };
  }, [user]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Lỗi khi mark as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Lỗi khi mark all as read', error);
    }
  };

  const toggleDropdown = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    
    // Nếu đang mở chuông ra và có thông báo chưa đọc, tự động đánh dấu đã đọc hết
    if (nextState && unreadCount > 0) {
      markAllAsRead();
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in slide-in-from-top-2">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Thông báo</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <Check size={14} /> Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                Bạn chưa có thông báo nào.
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    onClick={() => { if (!notif.read) markAsRead(notif.id); }}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="mt-1">
                      <div className={`w-2 h-2 rounded-full ${!notif.read ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                    </div>
                    <div>
                      <h4 className={`text-sm ${!notif.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {notif.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-gray-400 mt-2 font-medium">
                        {new Date(notif.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
