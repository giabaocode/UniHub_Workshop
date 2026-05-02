import React, { useState, useEffect, useContext, useRef } from 'react';
import { Camera, Save, Lock, LogOut, CheckCircle, AlertCircle, Mail, X, ShieldCheck, Loader2  } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import userService from '../services/user.service';

const UserProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, updateUser, user } = useContext(AuthContext);
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdmin = isAdminRoute || user?.role?.trim() === 'ADMIN';

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    avatarUrl: '',
    studentId: '',
    faculty: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const fileInputRef = useRef(null);

  // --- ĐỌC CẤU HÌNH CLOUDINARY TỪ FILE .ENV CỦA BẠN ---
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getProfile();
        setProfile({
          fullName: data.fullName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          avatarUrl: data.avatarUrl || '',
          studentId: data.studentId || '',
          faculty: data.faculty || ''
        });
      } catch (error) {
        setMessage({ type: 'error', text: 'Không thể tải thông tin cá nhân.' });
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
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // ============================================================
  // LOGIC UPLOAD ẢNH LÊN CLOUDINARY
  // ============================================================
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Vui lòng chọn file ảnh hợp lệ.' });
      return;
    }

    setIsUploading(true);
    setMessage({ type: '', text: '' });

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", UPLOAD_PRESET);

    try {
      // Sử dụng fetch trực tiếp lên Cloudinary từ nhánh main
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: uploadData,
      });
      const data = await response.json();

      if (data.secure_url) {
        const newAvatarUrl = data.secure_url;

        // Cập nhật State và Backend
        setProfile(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
        await userService.updateProfile({ ...profile, avatarUrl: newAvatarUrl });

        // Cập nhật Navbar ngay lập tức (Logic gọn gàng từ nhánh feat)
        updateUser({ fullName: profile.fullName, avatarUrl: newAvatarUrl });

        setMessage({ type: 'success', text: 'Đã cập nhật ảnh đại diện!' });
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        throw new Error(data.error?.message || "Lỗi từ Cloudinary");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage({ type: 'error', text: 'Lỗi tải ảnh lên mây. Hãy thử lại!' });
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await userService.updateProfile(profile);

      // Sync navbar immediately
      updateUser({ fullName: profile.fullName, avatarUrl: profile.avatarUrl });

      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Lỗi khi lưu thông tin.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    // Giữ nguyên logic sử dụng Modal xịn xò của nhánh feat
    setIsResettingPassword(true);
    setMessage({ type: '', text: '' });
    setShowPasswordModal(false);
    try {
      const res = await userService.forgotPassword(profile.email);
      setMessage({ type: 'success', text: res.message || 'Đã gửi email. Vui lòng kiểm tra hộp thư.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Lỗi yêu cầu đổi mật khẩu.' });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  // Khai báo mainContent để có thể render Modal ở bên dưới
  const mainContent = (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Hồ sơ cá nhân</h1>
        <p className="text-gray-500 mt-2">Quản lý thông tin và bảo mật tài khoản của bạn.</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row gap-12">
        {/* Left: Avatar */}
        <div className="flex flex-col items-center md:w-1/3 md:border-r border-gray-100 md:pr-8">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

          <div className="relative group cursor-pointer mt-4" onClick={handleAvatarClick}>
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100 relative">
              <img
                src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || 'User')}&background=3b82f6&color=fff&size=200`}
                alt="Avatar"
                className={`w-full h-full object-cover transition-all duration-300 ${isUploading ? 'opacity-30 blur-sm' : 'group-hover:scale-110'}`}
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white" size={32} />
              </div>
            </div>
          </div>

          <button onClick={handleAvatarClick} disabled={isUploading} className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors">
            {isUploading ? 'Đang xử lý...' : 'Thay đổi ảnh đại diện'}
          </button>

          <div className="w-full space-y-3 mt-10">
            <button 
              onClick={() => setShowPasswordModal(true)}
              disabled={isResettingPassword} 
              className="flex items-center justify-center gap-2 w-full px-6 py-3 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              <Lock size={18} />
              Đổi mật khẩu
            </button>
            {!isAdminRoute && (
              <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full px-6 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors">
                <LogOut size={18} />
                Đăng xuất
              </button>
            )}
          </div>
        </div>

        {/* Right: Form */}
        <div className="flex-1 space-y-8">
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Thông tin chi tiết</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Địa chỉ Email</label>
                <input type="email" value={profile.email} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed outline-none font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Họ và tên</label>
                <input type="text" name="fullName" value={profile.fullName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Số điện thoại</label>
                <input type="tel" name="phoneNumber" value={profile.phoneNumber} onChange={handleInputChange} placeholder="Nhập số điện thoại..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white font-medium" />
              </div>
              {!isAdmin && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">MSSV</label>
                    <input type="text" name="studentId" value={profile.studentId} onChange={handleInputChange} placeholder="SE123456" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Khoa</label>
                    <input type="text" name="faculty" value={profile.faculty} onChange={handleInputChange} placeholder="Công nghệ thông tin" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white font-medium" />
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button onClick={handleSaveProfile} disabled={isSaving} className="flex items-center gap-2 px-10 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 disabled:opacity-50">
                  <Save size={18} />
                  {isSaving ? 'Đang lưu...' : 'Lưu hồ sơ'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mainContent}

      {/* Password Reset Confirmation Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowPasswordModal(false); }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 px-8 pt-8 pb-10 text-center relative">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <ShieldCheck className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Xác nhận đặt lại mật khẩu</h3>
              <p className="text-blue-100 text-sm mt-1">Chúng tôi sẽ gửi link đặt lại về email của bạn</p>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-6">
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 mb-6">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="text-blue-600" size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Email nhận link</p>
                  <p className="text-sm font-bold text-gray-800 truncate">{profile.email}</p>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center mb-6">
                Link đặt lại mật khẩu sẽ hết hạn sau <strong className="text-gray-700">1 giờ</strong>.
                Vui lòng kiểm tra cả hộp thư spam nếu không thấy email.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handlePasswordReset}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-bold text-white hover:opacity-90 transition-opacity shadow-md shadow-blue-500/25"
                >
                  Gửi email ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;