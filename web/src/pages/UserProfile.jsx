import React from 'react';
import { Camera, Save, Lock, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animation-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Hồ sơ cá nhân</h1>
        <p className="text-gray-500 mt-2">Quản lý thông tin và bảo mật tài khoản của bạn.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row gap-12">
        {/* Left: Avatar */}
        <div className="flex flex-col items-center justify-between md:w-1/3 md:border-r border-gray-100 md:pr-8 pb-4">
          <div className="flex flex-col items-center space-y-4 w-full">
            <div className="relative group cursor-pointer mt-4">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-50 shadow-md">
                <img 
                  src="https://ui-avatars.com/api/?name=User&background=fff&color=3b82f6&size=200" 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={32} />
              </div>
            </div>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mb-4">
              Đổi ảnh đại diện
            </button>
          </div>

          {/* Đăng xuất (Chỉ hiện ở trang Sinh viên) */}
          {!isAdminRoute && (
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-2 w-full px-6 py-3 mt-8 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors shadow-sm"
            >
              <LogOut size={18} />
              Đăng xuất hệ thống
            </button>
          )}
        </div>

        {/* Right: Form */}
        <div className="flex-1 space-y-10">
          {/* Thông tin cơ bản */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Thông tin cơ bản</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và tên</label>
                <input 
                  type="text" 
                  defaultValue="Nguyễn Văn User"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input 
                  type="email" 
                  defaultValue="user@unihub.edu.vn"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số điện thoại</label>
                <input 
                  type="tel" 
                  defaultValue="0123456789"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <div className="flex justify-end pt-2">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20">
                  <Save size={18} />
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </section>

          {/* Đổi mật khẩu */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Đổi mật khẩu</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu cũ</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu mới</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Xác nhận mật khẩu</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <div className="flex justify-end pt-2">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-md">
                  <Lock size={18} />
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
