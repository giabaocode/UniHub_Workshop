import Swal from 'sweetalert2';
import React, { useState, useEffect, useContext } from 'react';
import { QrCode, XCircle, CheckCircle, Loader2, LogOut, Wifi, WifiOff } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { workshopService } from '../services/workshopService';
import { AuthContext } from '../context/authContext';
import { useNavigate } from 'react-router-dom';

const CheckInPage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [workshops, setWorkshops] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [currentAttendees, setCurrentAttendees] = useState([]); // Chứa danh sách SV của workshop đang chọn
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scanResult, setScanResult] = useState(null); // { type: 'success'|'error'|'dup', message }

  // Offline check-in
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineCheckIns, setOfflineCheckIns] = useState(() =>
    JSON.parse(localStorage.getItem('offlineCheckIns') || '[]')
  );

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Tự động đồng bộ khi có mạng lại
  useEffect(() => {
    if (!isOffline && offlineCheckIns.length > 0) {
      syncOfflineData();
    }
  }, [isOffline]);

  const syncOfflineData = async () => {
    const toSync = [...offlineCheckIns];
    const success = [];
    for (const attendeeId of toSync) {
      try {
        await workshopService.checkInAttendee(attendeeId);
        success.push(attendeeId);
      } catch (e) { /* bỏ qua lỗi lẻ */ }
    }
    const remaining = toSync.filter(id => !success.includes(id));
    setOfflineCheckIns(remaining);
    localStorage.setItem('offlineCheckIns', JSON.stringify(remaining));
    if (success.length > 0) {
      Swal.fire(`✅ Đã đồng bộ ${success.length} check-in offline lên Server!`);
    }
  };

  // Lấy danh sách Workshop (Có Cache Offline)
  useEffect(() => {
    workshopService.getAllWorkshops()
      .then(data => {
        const today = new Date().toISOString().split('T')[0];
        const upcoming = data.filter(w => w.eventDate >= today);
        setWorkshops(upcoming);
        localStorage.setItem('cachedWorkshops', JSON.stringify(upcoming)); // Lưu cache
      })
      .catch(err => {
        console.error("Lỗi lấy workshops:", err);
        const cached = localStorage.getItem('cachedWorkshops');
        if (cached) setWorkshops(JSON.parse(cached)); // Lấy từ cache nếu mất mạng
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Tải trước danh sách Attendees khi chọn Workshop (Để quét QR Offline không bị lỗi)
  useEffect(() => {
    if (!selectedWorkshop) {
      setCurrentAttendees([]);
      return;
    }
    
    setIsLoading(true);
    workshopService.getAttendeesByWorkshopId(selectedWorkshop.id)
      .then(data => {
        setCurrentAttendees(data);
        localStorage.setItem(`attendees_${selectedWorkshop.id}`, JSON.stringify(data)); // Lưu cache cho event này
      })
      .catch(err => {
        console.error("Lỗi lấy attendees:", err);
        const cached = localStorage.getItem(`attendees_${selectedWorkshop.id}`);
        if (cached) setCurrentAttendees(JSON.parse(cached)); // Lấy từ cache nếu mất mạng
      })
      .finally(() => setIsLoading(false));
  }, [selectedWorkshop]);

  // Xử lý QR quét được
  const handleQrScan = async (decodedText) => {
    if (!selectedWorkshop) return;
    
    // Lọc mã QR (Đề phòng quét trúng URL hoặc có khoảng trắng)
    let scannedCode = decodedText.trim();
    if (scannedCode.includes('/')) {
      scannedCode = scannedCode.split('/').pop(); // Lấy phần cuối nếu là link
    }
    scannedCode = scannedCode.toUpperCase();

    try {
      // TÌM TRONG DANH SÁCH ĐÃ TẢI SẴN (Không gọi API lúc quét)
      const matched = currentAttendees.find(a => a.ticketCode && a.ticketCode.toUpperCase() === scannedCode);

      if (!matched) {
        setScanResult({ type: 'error', message: `❌ Mã "${scannedCode}" không hợp lệ hoặc không thuộc sự kiện này!` });
        return;
      }
      
      if (matched.isCheckedIn) {
        setScanResult({ type: 'dup', message: `⚠️ Vé "${scannedCode}" đã được check-in trước đó rồi!` });
        return;
      }

      if (isOffline) {
        const newList = [...offlineCheckIns, matched.id];
        setOfflineCheckIns(newList);
        localStorage.setItem('offlineCheckIns', JSON.stringify(newList));
        
        // Cập nhật giao diện tạm thời để chống quét trùng 2 lần khi offline
        setCurrentAttendees(prev => prev.map(a => a.id === matched.id ? { ...a, isCheckedIn: true } : a));
        setScanResult({ type: 'success', message: `✅ [OFFLINE] Đã lưu check-in cho vé ${scannedCode}. Sẽ đồng bộ khi có mạng.` });
      } else {
        await workshopService.checkInAttendee(matched.id);
        
        // Cập nhật giao diện
        setCurrentAttendees(prev => prev.map(a => a.id === matched.id ? { ...a, isCheckedIn: true } : a));
        setScanResult({ type: 'success', message: `✅ Check-in thành công: ${matched.name || scannedCode}` });
      }
    } catch (err) {
      setScanResult({ type: 'error', message: `Lỗi: ${err.message}` });
    }

    // Tự tắt kết quả sau 4 giây
    setTimeout(() => setScanResult(null), 4000);
  };

  // Khởi động / dọn scanner
  useEffect(() => {
    if (!isScannerOpen) return;

    const html5QrCode = new Html5Qrcode("checkin-qr-reader");
    let shouldStop = false;

    const startPromise = html5QrCode.start(
      { facingMode: "environment" }, // Bắt buộc dùng camera sau
      {
        fps: 10,
        qrbox: { width: 260, height: 260 },
        formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ] // CHỈ cho phép quét mã QR vuông (Bỏ qua Barcode vạch)
      },
      (text) => {
        setIsScannerOpen(false); // Đóng camera
        handleQrScan(text);      // Xử lý mã
      },
      () => {} // Bỏ qua frame nhiễu
    );

    startPromise.then(() => {
      if (shouldStop) {
        html5QrCode.stop().catch(() => {});
      }
    }).catch((err) => {
      console.error("Camera error:", err);
      if (!shouldStop) {
        setIsScannerOpen(false);
        setScanResult({ type: 'error', message: 'Không thể mở Camera. Vui lòng cấp quyền.' });
      }
    });

    return () => { 
      shouldStop = true;
      startPromise.then(() => {
        html5QrCode.stop().catch(() => {});
      }).catch(() => {});
    };
  }, [isScannerOpen]); // Lấy selectedWorkshop tại thời điểm mở scanner

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">U</div>
          <div>
            <p className="font-bold text-sm">UniHub Check-in</p>
            <p className="text-xs text-blue-300">Staff: {user?.fullName || user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isOffline ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-400/10 px-3 py-1.5 rounded-full border border-red-400/20">
              <WifiOff size={14} className="animate-pulse" /> Offline ({offlineCheckIns.length} chờ sync)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
              <Wifi size={14} /> Online
            </span>
          )}
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start p-4 gap-5 max-w-lg mx-auto w-full pt-6">
        {/* Chọn Workshop */}
        <div className="w-full bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5">
          <label className="text-sm font-semibold text-blue-300 mb-2 block">1. Chọn Workshop cần Check-in</label>
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
              <Loader2 size={16} className="animate-spin" /> Đang tải danh sách...
            </div>
          ) : (
            <select
              value={selectedWorkshop?.id || ''}
              onChange={(e) => setSelectedWorkshop(workshops.find(w => w.id === Number(e.target.value)) || null)}
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" className="bg-slate-800">-- Chọn sự kiện --</option>
              {workshops.map(ws => (
                <option key={ws.id} value={ws.id} className="bg-slate-800">
                  {ws.title} ({ws.eventDate || 'N/A'})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Nút quét */}
        <button
          onClick={() => { setScanResult(null); setIsScannerOpen(true); }}
          disabled={!selectedWorkshop || isScannerOpen}
          className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-blue-600/30 transition-all active:scale-95"
        >
          <QrCode size={26} />
          2. Quét mã QR Check-in
        </button>

        {/* Scanner frame */}
        {isScannerOpen && (
          <div className="w-full bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 flex flex-col items-center gap-4">
            <div className="flex justify-between w-full items-center">
              <p className="font-bold text-sm">Đưa mã QR vào khung hình</p>
              <button onClick={() => setIsScannerOpen(false)} className="text-gray-400 hover:text-red-400 transition-colors">
                <XCircle size={22} />
              </button>
            </div>
            {/* Vùng chứa video camera */}
            <div className="w-full bg-black/50 rounded-xl overflow-hidden border-2 border-blue-500/40 relative min-h-[300px] flex items-center justify-center">
              <div id="checkin-qr-reader" className="w-full absolute inset-0 flex items-center justify-center [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />
            </div>
          </div>
        )}

        {/* Kết quả quét */}
        {scanResult && (
          <div className={`w-full rounded-2xl border p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
            scanResult.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : scanResult.type === 'dup'   ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            :                               'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            {scanResult.type === 'success' ? <CheckCircle size={20} className="shrink-0 mt-0.5" /> : <XCircle size={20} className="shrink-0 mt-0.5" />}
            <p className="text-sm font-medium">{scanResult.message}</p>
          </div>
        )}

        {/* Hướng dẫn */}
        {!isScannerOpen && !scanResult && (
          <p className="text-center text-xs text-blue-300/60 leading-relaxed">
            Khi mất mạng, hệ thống tự động lưu tạm check-in vào máy.<br />
            Dữ liệu sẽ đồng bộ lên Server khi kết nối được phục hồi.
          </p>
        )}
      </div>
    </div>
  );
};

export default CheckInPage;
