import Swal from "sweetalert2";
import React, { useState, useRef } from "react";
import { MapPin, X, Loader2, Upload } from "lucide-react";
import cloudinaryService from "../services/cloudinary.service";

/**
 * Upload sơ đồ phòng (image) — admin gắn vào workshop để FE student hiển thị
 * thay cho placeholder cũ. Chỉ accept image, max 5MB.
 */
const RoomMapUploader = ({ value, onChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire("Vui lòng chọn file hình ảnh hợp lệ.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire("Ảnh sơ đồ quá lớn (tối đa 5MB).");
      return;
    }

    setIsUploading(true);
    try {
      const url = await cloudinaryService.uploadImage(file);
      onChange(url);
    } catch (err) {
      Swal.fire("Lỗi upload sơ đồ phòng: " + (err.message || "Không xác định"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MapPin size={20} className="text-blue-500" /> Sơ đồ phòng
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Tải ảnh sơ đồ phòng (PNG/JPG) để sinh viên xem trước khi đến sự kiện.
          Tùy chọn.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />

      {!value ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full aspect-video rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all flex flex-col items-center justify-center text-gray-500"
        >
          {isUploading ? (
            <>
              <Loader2 size={32} className="text-blue-500 animate-spin mb-2" />
              <span className="text-sm font-medium">Đang tải sơ đồ...</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-3 text-blue-500">
                <Upload size={22} />
              </div>
              <span className="text-sm font-medium">
                Click để tải sơ đồ phòng
              </span>
              <span className="text-xs text-gray-400 mt-1">Tối đa 5MB</span>
            </>
          )}
        </button>
      ) : (
        <div className="relative w-full aspect-video rounded-2xl border border-gray-200 overflow-hidden group">
          <img
            src={value}
            alt="Sơ đồ phòng"
            className="w-full h-full object-contain bg-gray-50"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
            <button
              type="button"
              onClick={handleRemove}
              className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg shadow-lg hover:bg-red-600 flex items-center gap-2 transition-colors"
            >
              <X size={16} strokeWidth={3} /> Xóa sơ đồ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomMapUploader;
