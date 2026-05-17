import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2, Copy, Check, AlertCircle } from 'lucide-react';
import ticketService from '../services/ticket.service';
import { API_BASE_URL } from '../config/api';

const CheckoutModal = ({ isOpen, onClose, workshopTitle, paymentData, workshopId }) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const canShowQr = Boolean(paymentData?.qrUrl);

  useEffect(() => {
    if (!isOpen || isSuccess || !paymentData?.memo || !paymentData?.qrUrl) return;

    const interval = setInterval(async () => {
      try {
        const res = await ticketService.getTicketStatus(paymentData.memo);
        
        console.log("Trạng thái thanh toán:", res.status);

        if (res.status === 'PAID') {
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
  }, [isOpen, paymentData?.memo, isSuccess, onClose]);

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
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">
                {canShowQr ? 'Quét mã thanh toán' : 'Đã giữ chỗ'}
              </h2>
              
              {canShowQr ? (
                <div className="flex items-center justify-center gap-2 mb-6 text-blue-600">
                  <Loader2 className="animate-spin" size={18} />
                  <span className="text-sm font-semibold animate-pulse">Đang chờ tín hiệu từ ngân hàng...</span>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center mb-6">
                  Cổng thanh toán đang tạm thời gián đoạn. Bạn đã được đưa vào hàng đợi thanh toán sau.
                </p>
              )}

              {/* QR Code */}
              {canShowQr && (
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
              )}

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 mb-8 flex gap-3">
                <AlertCircle className="text-amber-500 shrink-0" size={18} />
                <p className="text-[11px] text-amber-700 leading-tight">
                  {canShowQr
                    ? 'Vui lòng không đóng cửa sổ này. Sau khi bạn chuyển khoản thành công, hệ thống sẽ tự động chuyển trang.'
                    : 'Khi cổng thanh toán hoạt động trở lại, vào mục Vé của tôi để tiếp tục thanh toán.'}
                </p>
              </div>

              {/* Các nút điều khiển */}
              <div className="flex flex-col gap-2">
               
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
