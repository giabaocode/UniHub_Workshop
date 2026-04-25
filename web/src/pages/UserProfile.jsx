import React, { useState, useEffect, useContext, useRef } from 'react';
import { Camera, Save, Lock, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import userService from '../services/user.service';

const UserProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, updateUser } = useContext(AuthContext);
  const isAdminRoute = location.pathname.startsWith('/admin');

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    avatarUrl: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getProfile();
        setProfile({
          fullName: data.fullName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          avatarUrl: data.avatarUrl || ''
        });
      } catch (error) {
        setMessage({ type: 'error', text: 'Không thể tải thông tin cá nhân. Vui lòng thử lại sau.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await userService.uploadAvatar(file);
      const newAvatarUrl = res.url;
      
      // Update local state
      setProfile(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
      
      // Automatically save the profile with new avatar
      await userService.updateProfile({ ...profile, avatarUrl: newAvatarUrl });

      // Sync global auth context so Header updates immediately
      updateUser({ avatarUrl: newAvatarUrl });
      
      setMessage({ type: 'success', text: 'Đã cập nhật ảnh đại diện!' });
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Lỗi tải ảnh lên.' });
    } finally {
      setIsUploading(false);
      // Reset input value so the same file can be selected again if needed
      e.target.value = null;
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await userService.updateProfile(profile);

      // Sync global auth context so Header name updates immediately
      updateUser({ fullName: profile.fullName, avatarUrl: profile.avatarUrl });

      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Có lỗi xảy ra khi lưu thông tin.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn nhận email để thay đổi mật khẩu?')) return;
    
    setIsResettingPassword(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await userService.requestPasswordReset();
      setMessage({ type: 'success', text: res.message || 'Đã gửi email xác nhận. Vui lòng kiểm tra.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Có lỗi xảy ra khi yêu cầu đổi mật khẩu.' });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animation-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Hồ sơ cá nhân</h1>
        <p className="text-gray-500 mt-2">Quản lý thông tin và bảo mật tài khoản của bạn.</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row gap-12">
        {/* Left: Avatar & Actions */}
        <div className="flex flex-col items-center md:w-1/3 md:border-r border-gray-100 md:pr-8 pb-4">
          <div className="flex flex-col items-center space-y-4 w-full">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            <div className="relative group cursor-pointer mt-4" onClick={handleAvatarClick}>
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-50 shadow-md">
                <img 
                  src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || 'User')}&background=fff&color=3b82f6&size=200`}
                  alt="Avatar" 
                  className={`w-full h-full object-cover ${isUploading ? 'opacity-50' : ''}`}
                />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={32} />
              </div>
            </div>
            <button 
              onClick={handleAvatarClick}
              disabled={isUploading}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mb-8 disabled:opacity-50"
            >
              {isUploading ? 'Đang tải lên...' : 'Đổi ảnh đại diện'}
            </button>
          </div>

          <div className="w-full space-y-3 mt-auto">
            <button 
              onClick={handlePasswordReset}
              disabled={isResettingPassword}
              className="flex items-center justify-center gap-2 w-full px-6 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              <Lock size={18} />
              {isResettingPassword ? 'Đang gửi...' : 'Thay đổi mật khẩu'}
            </button>

            {!isAdminRoute && (
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors shadow-sm"
              >
                <LogOut size={18} />
                Đăng xuất hệ thống
              </button>
            )}
          </div>
        </div>

        {/* Right: Form */}
        <div className="flex-1 space-y-10">
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Thông tin cơ bản</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
                />
                <p className="text-xs text-gray-400 mt-1.5">Email được dùng làm tài khoản đăng nhập nên không thể thay đổi.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và tên</label>
                <input 
                  type="text" 
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số điện thoại</label>
                <input 
                  type="tel" 
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Chưa cập nhật"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
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
