import React, { useState } from 'react';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const CheckoutModal = ({ isOpen, onClose, workshopTitle, price }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 2000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={!isProcessing ? onClose : undefined}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Thanh toán vé</h2>
          
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle2 size={64} className="text-emerald-500 mb-4 animate-bounce" />
              <p className="text-xl font-bold text-gray-900">Thanh toán thành công!</p>
              <p className="text-gray-500 mt-2 text-center">Vé đã được xác nhận thành công.</p>
            </div>
          ) : (
            <>
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Sự kiện</p>
                <p className="font-semibold text-gray-900 mb-3">{workshopTitle}</p>
                
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-gray-600 font-medium">Tổng tiền:</span>
                  <span className="text-2xl font-extrabold text-blue-600">{price}</span>
                </div>
              </div>

              {/* QR Code Fake */}
              <div className="flex flex-col items-center mb-8">
                <p className="text-sm font-medium text-gray-500 mb-3">Quét mã QR bằng ứng dụng ngân hàng</p>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                  <QRCodeSVG value={`payment-${workshopTitle}-${price}`} size={160} level="H" />
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all ${
                  isProcessing 
                    ? 'bg-blue-400 text-white cursor-not-allowed opacity-80' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={24} />
                    Đang xử lý...
                  </>
                ) : (
                  'Xác nhận thanh toán'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
