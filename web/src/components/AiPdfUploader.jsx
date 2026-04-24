import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';

const AiPdfUploader = () => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span className="bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">AI Smart Assistant</span>
        </h2>
        <p className="text-xs text-gray-500 mt-1">Hỗ trợ trích xuất thông tự động từ tài liệu PDF</p>
      </div>
      <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`flex-1 min-h-[200px] flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 ${isDragging ? 'border-blue-500 bg-blue-50/80 scale-[1.02]' : 'border-gray-300 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-400'}`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-400 shadow-sm border border-gray-100'}`}>
          <UploadCloud size={24} />
        </div>
        <h3 className="text-md font-bold text-gray-800 mb-1">Kéo thả file PDF vào đây</h3>
        <p className="text-xs text-gray-500 mb-4">hoặc click để chọn file. AI sẽ tự động đọc nội dung.</p>
        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg shadow-sm hover:bg-gray-50 hover:text-blue-600 transition-colors">
          Duyệt file từ máy tính
        </button>
      </div>
    </div>
  );
};

export default AiPdfUploader;