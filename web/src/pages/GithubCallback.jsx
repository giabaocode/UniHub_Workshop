import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/authContext';

const GithubCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { githubLogin } = useContext(AuthContext);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processGithubCallback = async () => {
      // Extract the 'code' parameter from the URL
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');

      if (!code) {
        setError('Không tìm thấy mã xác thực từ GitHub.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        await githubLogin(code);
        // Successful login, redirect to home
        navigate('/');
      } catch (err) {
        console.error('Lỗi khi đăng nhập bằng GitHub:', err);
        setError(err.message || 'Lỗi khi xác thực với GitHub.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    processGithubCallback();
  }, [location, navigate, githubLogin]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
        {error ? (
          <>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Lỗi Đăng Nhập</h2>
            <p className="text-gray-600">{error}</p>
            <p className="text-sm text-gray-400 mt-4">Đang chuyển hướng về trang đăng nhập...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Đang xác thực GitHub...</h2>
            <p className="text-gray-600">Vui lòng đợi trong giây lát.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default GithubCallback;
