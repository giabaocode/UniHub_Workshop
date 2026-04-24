import React, { useState } from 'react';
import { Settings as SettingsIcon, Monitor, Bell } from 'lucide-react';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('system');
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt chung</h1>
        <p className="text-gray-500 text-sm mt-1">Quản lý các cấu hình hệ thống của bạn.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        {/* Menu dọc */}
        <div className="w-full md:w-64 border-r border-gray-100 md:pr-6 space-y-2">
          <button 
            onClick={() => setActiveTab('system')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'system' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <SettingsIcon size={20} />
            Cài đặt hệ thống
          </button>
          <button 
            onClick={() => setActiveTab('ui')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'ui' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Monitor size={20} />
            Giao diện
          </button>
        </div>

        {/* Nội dung cài đặt */}
        <div className="flex-1 space-y-8 min-h-[300px]">
          {activeTab === 'system' ? (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-6">Cài đặt hệ thống</h2>
              <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Bell size={18} className="text-gray-500"/> Nhận thông báo qua Email
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Nhận email khi có workshop mới hoặc người đăng ký mua vé.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-6">Tùy chỉnh Giao diện</h2>
              <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Monitor size={18} className="text-gray-500"/> Chế độ tối (Dark Mode)
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Chuyển đổi giao diện sang nền tối để bảo vệ mắt.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
