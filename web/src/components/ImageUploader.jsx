import React, { useState, useRef } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';

const ImageUploader = ({ value, onChange, error }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME; 
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, webp...)');
      return;
    }

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: uploadData,
      });
      const data = await response.json();
      
      if (data.secure_url) {
        onChange(data.secure_url); // Truyền link ảnh ra bên ngoài Form
      } else {
        alert("Lỗi upload ảnh: " + (data.error?.message || "Không xác định"));
      }
    } catch (error) {
      console.error("Lỗi upload:", error);
      alert("Lỗi kết nối khi tải ảnh lên.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onChange(""); // Xóa link ảnh
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">Ảnh bìa Sự kiện <span className="text-red-500">*</span></h2>
        <p className="text-xs text-gray-500 mt-1">Tỉ lệ khuyên dùng 16:9 (Ví dụ: 1280x720px)</p>
      </div>

      <div className="w-full">
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
        {!value ? (
          <button type="button" onClick={() => fileInputRef.current.click()} disabled={isUploading} className={`w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'}`}>
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-blue-500" size={32} />
                <span className="text-sm font-medium text-gray-500">Đang tải lên...</span>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-3 text-gray-400"><ImagePlus size={24} /></div>
                <span className="text-sm font-medium text-gray-600">Click để chọn ảnh bìa</span>
              </>
            )}
          </button>
        ) : (
          <div className="relative w-full aspect-video rounded-2xl border border-gray-200 overflow-hidden group">
            <img src={value} alt="Cover Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <button type="button" onClick={handleRemoveImage} className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg shadow-lg hover:bg-red-600 flex items-center gap-2 transition-colors transform hover:scale-105">
                <X size={16} strokeWidth={3} /> Xóa ảnh này
              </button>
            </div>
          </div>
        )}
        {error && <p className="text-red-500 text-xs mt-2 font-medium text-center">{error}</p>}
      </div>
    </div>
  );
};

export default ImageUploader;