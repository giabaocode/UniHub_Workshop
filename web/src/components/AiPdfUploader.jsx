import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Sparkles, Loader2, X } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import geminiService from '../services/gemini.service';

// Set worker source for pdf.js (local from node_modules)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Trích xuất toàn bộ text từ file PDF
 */
const extractTextFromPdf = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  return fullText.trim();
};

/**
 * Upload file PDF lên Cloudinary (resource_type: raw)
 */
const uploadPdfToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('resource_type', 'raw');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Upload PDF lên Cloudinary thất bại');
  const data = await res.json();
  return data.secure_url;
};

// Trạng thái xử lý
const STEPS = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  EXTRACTING: 'extracting',
  SUMMARIZING: 'summarizing',
  DONE: 'done',
  ERROR: 'error',
};

const STEP_LABELS = {
  [STEPS.UPLOADING]: 'Đang tải file lên Cloudinary...',
  [STEPS.EXTRACTING]: 'Đang trích xuất nội dung PDF...',
  [STEPS.SUMMARIZING]: 'AI đang phân tích và tóm tắt...',
};

const AiPdfUploader = ({ onResult }) => {
  const [step, setStep] = useState(STEPS.IDLE);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState(null); // { pdfUrl, briefSummary, detailedSummary, hashtags }
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setError('Chỉ chấp nhận file PDF.');
      setStep(STEPS.ERROR);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File PDF quá lớn (tối đa 10MB).');
      setStep(STEPS.ERROR);
      return;
    }

    setFileName(file.name);
    setError('');
    setResult(null);

    try {
      // 1. Upload lên Cloudinary
      setStep(STEPS.UPLOADING);
      const pdfUrl = await uploadPdfToCloudinary(file);

      // 2. Trích xuất text
      setStep(STEPS.EXTRACTING);
      const pdfText = await extractTextFromPdf(file);
      console.log('[PDF extracted text length]', pdfText.length);

      if (pdfText.length < 30) {
        throw new Error('Không thể trích xuất nội dung từ PDF này (file có thể là ảnh scan).');
      }

      // 3. Gửi Gemini tóm tắt
      setStep(STEPS.SUMMARIZING);
      const aiResult = await geminiService.summarizePdfContent(pdfText);


      // -> Bổ sung dòng log này để kiểm tra cấu trúc thật của AI trả về
      console.log("Dữ liệu Gemini trả về:", aiResult); 

      const finalResult = {
        pdfUrl,
        briefSummary: aiResult.briefSummary || '',
        // -> SỬA DÒNG NÀY: Thêm các dự phòng (||) để bắt đúng tên biến của bản chi tiết
        detailedSummary: aiResult.detailedSummary || aiResult.description || aiResult.summary || aiResult.content || aiResult.text || '',
        hashtags: aiResult.hashtags || [],
      };

      setResult(finalResult);
      setStep(STEPS.DONE);

      // Callback cho parent component
      if (onResult) onResult(finalResult);
    } catch (err) {
      console.error('[AiPdfUploader error]', err);
      setError(err.message || 'Có lỗi xảy ra khi xử lý PDF.');
      setStep(STEPS.ERROR);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = null;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleReset = () => {
    setStep(STEPS.IDLE);
    setError('');
    setFileName('');
    setResult(null);
    if (onResult) onResult(null);
  };

  const isProcessing = [STEPS.UPLOADING, STEPS.EXTRACTING, STEPS.SUMMARIZING].includes(step);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span className="bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">AI Smart Assistant</span>
        </h2>
        <p className="text-xs text-gray-500 mt-1">Upload file PDF giới thiệu workshop. AI sẽ tự động trích xuất và tóm tắt nội dung.</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* IDLE — Khu vực upload */}
      {step === STEPS.IDLE && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex-1 min-h-[200px] flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer ${
            isDragging
              ? 'border-blue-500 bg-blue-50/80 scale-[1.02]'
              : 'border-gray-300 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${
            isDragging ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-400 shadow-sm border border-gray-100'
          }`}>
            <UploadCloud size={24} />
          </div>
          <h3 className="text-md font-bold text-gray-800 mb-1">Kéo thả file PDF vào đây</h3>
          <p className="text-xs text-gray-500 mb-4">hoặc click để chọn file (tối đa 10MB)</p>
          <span className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg shadow-sm hover:bg-gray-50 hover:text-blue-600 transition-colors">
            Duyệt file từ máy tính
          </span>
        </div>
      )}

      {/* PROCESSING — Đang xử lý */}
      {isProcessing && (
        <div className="flex-1 min-h-[200px] flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 p-6">
          <div className="relative mb-4">
            <Loader2 size={40} className="text-purple-500 animate-spin" />
            <Sparkles size={16} className="text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{fileName}</span>
          </div>
          <p className="text-sm font-semibold text-purple-600 animate-pulse">{STEP_LABELS[step]}</p>

          {/* Progress steps */}
          <div className="flex items-center gap-2 mt-4">
            {[STEPS.UPLOADING, STEPS.EXTRACTING, STEPS.SUMMARIZING].map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-full transition-all ${
                  step === s ? 'bg-purple-500 animate-pulse scale-125' :
                  [STEPS.UPLOADING, STEPS.EXTRACTING, STEPS.SUMMARIZING].indexOf(step) > i
                    ? 'bg-green-400' : 'bg-gray-200'
                }`} />
                {i < 2 && <div className="w-6 h-0.5 bg-gray-200" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DONE — Kết quả */}
      {step === STEPS.DONE && result && (
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-200">
            <CheckCircle size={18} />
            <span className="text-sm font-semibold">AI đã tóm tắt thành công!</span>
            <button onClick={handleReset} className="ml-auto text-gray-400 hover:text-red-500 transition-colors" title="Xóa & chọn lại">
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FileText size={14} />
            <span className="truncate">{fileName}</span>
          </div>

          <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100">
            <p className="text-sm text-gray-700 leading-relaxed italic mb-2">Tóm tắt ngắn (AI Card):</p>
            <p className="text-sm text-gray-900 leading-relaxed font-medium">{result.briefSummary}</p>
            
            {result.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {result.hashtags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs font-semibold rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ERROR */}
      {step === STEPS.ERROR && (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] rounded-2xl bg-red-50/50 p-6">
          <AlertCircle size={32} className="text-red-400 mb-3" />
          <p className="text-sm text-red-600 font-medium text-center mb-4">{error}</p>
          <button
            onClick={handleReset}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}
    </div>
  );
};

export default AiPdfUploader;