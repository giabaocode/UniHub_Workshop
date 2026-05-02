import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2, Copy, Check, AlertCircle } from 'lucide-react';
import ticketService from '../services/ticket.service';

const CheckoutModal = ({ isOpen, onClose, workshopTitle, paymentData, workshopId }) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Cơ chế tự động kiểm tra trạng thái vé (Polling)
  // Cơ chế tự động kiểm tra trạng thái vé (Polling)
  useEffect(() => {
    // Nếu modal không mở hoặc không có workshopId thì không làm gì
    if (!isOpen || isSuccess) return;

    const interval = setInterval(async () => {
      try {
        // Hỏi Backend xem có vé chưa
        const res = await ticketService.checkRegistration(workshopId);
        
        // In ra để bạn nhìn thấy tận mắt cú lừa của JS
        console.log("Kết quả từ Backend:", res);

        // ĐÂY LÀ ĐIỂM CHỐT HẠ: Phải kiểm tra chính xác biến isRegistered bên trong res
        if (res.isRegistered === true) {
          setIsSuccess(true);
          clearInterval(interval);
          
          // Đóng modal sau khi hiện thành công 3 giây
          setTimeout(() => {
            onClose();
            window.location.reload(); 
          }, 3000);
        }
      } catch (error) {
        console.log("Đang chờ thanh toán...");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, workshopId, isSuccess, onClose]);

  if (!isOpen || !paymentData) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
        <div className="p-8">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={48} className="text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Thanh toán thành công!</h3>
              <p className="text-gray-500 mt-2">Hệ thống đã xác nhận vé của bạn.</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">Quét mã thanh toán</h2>
              
              {/* Hiệu ứng chờ đợi */}
              <div className="flex items-center justify-center gap-2 mb-6 text-blue-600">
                <Loader2 className="animate-spin" size={18} />
                <span className="text-sm font-semibold animate-pulse">Đang chờ tín hiệu từ ngân hàng...</span>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center mb-6">
                <div className="p-3 bg-white border-2 border-blue-100 rounded-2xl shadow-inner mb-4">
                  <img src={paymentData.qrUrl} alt="Payment QR" className="w-52 h-52 object-contain" />
                </div>
                
                <div className="w-full space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-400 font-bold uppercase">Nội dung</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(paymentData.memo);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="flex items-center gap-1.5 text-blue-600 font-bold"
                    >
                      <span className="font-mono">{paymentData.memo}</span>
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 mb-8 flex gap-3">
                <AlertCircle className="text-amber-500 shrink-0" size={18} />
                <p className="text-[11px] text-amber-700 leading-tight">
                  Vui lòng không đóng cửa sổ này. Sau khi bạn chuyển khoản thành công, hệ thống sẽ tự động chuyển trang.
                </p>
              </div>

              {/* Các nút điều khiển */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={async () => {
                    try {
                      // Gọi API giả lập webhook
                      const res = await fetch("http://localhost:8080/api/webhooks/sepay", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ content: paymentData.memo })
                      });
                      if (!res.ok) throw new Error("Lỗi khi gọi giả lập webhook: " + res.statusText);
                      console.log("Đã giả lập gửi Webhook SePay thành công!");
                    } catch (error) {
                      alert("Lỗi mô phỏng thanh toán: " + error.message);
                    }
                  }}
                  className="w-full py-3.5 bg-emerald-50 text-emerald-600 font-bold hover:bg-emerald-100 transition-all rounded-2xl border border-emerald-200 flex justify-center items-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  Giả lập Đã chuyển tiền (Test Local)
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3.5 text-gray-400 font-bold hover:text-red-500 transition-all border-2 border-transparent hover:border-red-100 rounded-2xl"
                >
                  Huỷ giao dịch
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;