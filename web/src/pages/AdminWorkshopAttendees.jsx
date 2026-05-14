import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle, XCircle, Ticket, Users, CheckSquare, Loader2, QrCode } from 'lucide-react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
// IMPORT SERVICE VÀO ĐÂY
import { workshopService } from '../services/workshopService';

const AdminWorkshopAttendees = () => {
  const { id } = useParams();

  // STATE LƯU DỮ LIỆU THẬT
  const [workshop, setWorkshop] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [processingIds, setProcessingIds] = useState([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const itemsPerPage = 10;

  // OFFLINE CHECK-IN STATE
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineCheckIns, setOfflineCheckIns] = useState(() => {
    return JSON.parse(localStorage.getItem('offlineCheckIns') || '[]');
  });

  // LẮNG NGHE SỰ KIỆN MẠNG
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // TỰ ĐỘNG ĐỒNG BỘ KHI CÓ MẠNG LẠI
  useEffect(() => {
    if (!isOffline && offlineCheckIns.length > 0) {
      syncOfflineData();
    }
  }, [isOffline, offlineCheckIns]);

  const syncOfflineData = async () => {
    if (offlineCheckIns.length === 0) return;

    // Tạo bản sao để tránh thao tác trùng
    const idsToSync = [...offlineCheckIns];
    let successIds = [];

    for (const attendeeId of idsToSync) {
      try {
        await workshopService.checkInAttendee(attendeeId);
        successIds.push(attendeeId);
      } catch (error) {
        console.error("Lỗi đồng bộ ID:", attendeeId, error);
      }
    }

    // Xóa những ID đã đồng bộ thành công khỏi LocalStorage
    const remainingIds = idsToSync.filter(id => !successIds.includes(id));
    setOfflineCheckIns(remainingIds);
    localStorage.setItem('offlineCheckIns', JSON.stringify(remainingIds));

    if (successIds.length > 0) {
      alert(`🎉 Đã đồng bộ thành công ${successIds.length} lượt Check-in lúc mất mạng lên Server!`);
    }
  };

  // GỌI API LẤY DỮ LIỆU KHI VÀO TRANG
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Lấy tên Workshop
        const wsData = await workshopService.getWorkshopById(id);
        setWorkshop(wsData);

        // Lấy danh sách Sinh viên đã đăng ký (Giả sử bạn sẽ viết thêm hàm này)
        const attendeesData = await workshopService.getAttendeesByWorkshopId(id);
        setAttendees(attendeesData);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // LOGIC CHECK-IN THẬT SỰ GỌI XUỐNG DB HOẶC LƯU OFFLINE
  const handleCheckIn = async (attendeeId) => {
    if (processingIds.includes(attendeeId)) return;
    setProcessingIds(prev => [...prev, attendeeId]);

    try {
      if (isOffline) {
        // CHẾ ĐỘ OFFLINE: Lưu ID vào LocalStorage thay vì gọi API
        const newOffline = [...offlineCheckIns, attendeeId];
        setOfflineCheckIns(newOffline);
        localStorage.setItem('offlineCheckIns', JSON.stringify(newOffline));

        // Vẫn cập nhật UI xanh lá để không kẹt hàng
        setAttendees(prev => prev.map(a =>
          a.id === attendeeId ? { ...a, isCheckedIn: true } : a
        ));
      } else {
        // CHẾ ĐỘ ONLINE: Gọi API bình thường
        await workshopService.checkInAttendee(attendeeId);

        setAttendees(prev => prev.map(a =>
          a.id === attendeeId ? { ...a, isCheckedIn: true } : a
        ));
      }
    } catch (error) {
      // Bắt trường hợp đang thao tác thì rớt mạng đột ngột (Failed to fetch)
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network Error')) {
        const newOffline = [...offlineCheckIns, attendeeId];
        setOfflineCheckIns(newOffline);
        localStorage.setItem('offlineCheckIns', JSON.stringify(newOffline));

        setAttendees(prev => prev.map(a =>
          a.id === attendeeId ? { ...a, isCheckedIn: true } : a
        ));
        alert("⚠️ Đã rớt mạng! Hệ thống tự động lưu Check-in Offline.");
      } else {
        alert("Lỗi Check-in: " + (error.message || "Không xác định"));
      }
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== attendeeId));
    }
  };

  // LOGIC MÁY QUÉT QR CODE
  useEffect(() => {
    if (isScannerOpen) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ] 
        },
        /* verbose= */ false
      );

      scanner.render((decodedText) => {
        // Lọc chuỗi (Đề phòng mã vạch rác, khoảng trắng, hoặc URL)
        let scannedCode = decodedText.trim();
        if (scannedCode.includes('/')) {
          scannedCode = scannedCode.split('/').pop();
        }
        scannedCode = scannedCode.toUpperCase();

        // Khi quét thành công, tìm attendee có mã vé khớp
        const matched = attendees.find(a => a.ticketCode && a.ticketCode.toUpperCase() === scannedCode);
        if (matched) {
          if (!matched.isCheckedIn) {
            handleCheckIn(matched.id);
            alert(`✅ Đã check-in thành công vé: ${scannedCode}`);
          } else {
            alert(`⚠️ Vé ${scannedCode} này ĐÃ ĐƯỢC CHECK-IN trước đó rồi!`);
          }
          scanner.clear();
          setIsScannerOpen(false);
        } else {
          alert(`❌ Mã vé "${scannedCode}" không hợp lệ hoặc không thuộc sự kiện này!`);
        }
      }, (error) => {
        // Bỏ qua lỗi rác khi đang quét
      });

      return () => {
        scanner.clear().catch(e => console.error(e));
      };
    }
  }, [isScannerOpen, attendees, isOffline]);

  // TỰ ĐỘNG TÍNH TOÁN THỐNG KÊ (REAL-TIME)
  const stats = {
    total: attendees.length,
    checkedIn: attendees.filter(a => a.isCheckedIn).length,
    notCheckedIn: attendees.filter(a => !a.isCheckedIn).length
  };

  // LOGIC TÌM KIẾM
  const filteredAttendees = attendees.filter(a =>
    a.ticketCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);

  }, [searchTerm]);

  const totalPages = Math.ceil(filteredAttendees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAttendees = filteredAttendees.slice(startIndex, startIndex + itemsPerPage);
  // NẾU ĐANG TẢI DỮ LIỆU THÌ HIỆN LOADING
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-gray-500 font-medium">Đang tải danh sách sinh viên...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8 animate-in fade-in duration-500">
      {/* Header & Back Button */}
      <div className="flex flex-col gap-4">
        <Link to="/admin" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors w-fit group">
          <ArrowLeft size={18} className="mr-1.5 group-hover:-translate-x-1 transition-transform" />
          Quay lại Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Danh sách tham dự: <span className="text-blue-600">{workshop?.title || `Workshop #${id}`}</span>
          </h1>
          <div className="flex gap-2">
            {isOffline && (
              <span className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl border border-red-200 text-sm shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                Offline ({offlineCheckIns.length} chờ Sync)
              </span>
            )}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm"
            >
              <QrCode size={16} />
              Quét QR Check-in
            </button>
            <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 font-bold rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-200 shadow-sm text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Xuất CSV
            </button>
          </div>
        </div>
      </div>

      {/* KHUNG QUÉT QR CODE */}
      {isScannerOpen && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="flex justify-between w-full mb-4">
            <h2 className="text-xl font-bold text-gray-900">Quét mã QR trên vé</h2>
            <button
              onClick={() => setIsScannerOpen(false)}
              className="text-gray-500 hover:text-red-500"
            >
              <XCircle size={24} />
            </button>
          </div>
          <div id="qr-reader" className="w-full max-w-md mx-auto overflow-hidden rounded-xl border-2 border-blue-100"></div>
          <p className="text-gray-500 text-sm mt-4">Đưa mã QR trên vé của sinh viên vào khung hình để tự động Check-in.</p>
        </div>
      )}

      {/* Quick Stats - Tự động nảy số */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Ticket size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-0.5">Tổng số vé đã bán</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
            <CheckSquare size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-0.5">Số người đã Check-in</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.checkedIn}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-0.5">Số người chưa Check-in</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.notCheckedIn}</h3>
          </div>
        </div>
      </div>

      {/* Table & Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
          <h2 className="text-lg font-bold text-gray-900">Danh sách Sinh viên</h2>
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={18} />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm Mã vé, Tên, MSSV..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                <th className="p-4 w-16 text-center">STT</th>
                <th className="p-4">Mã Vé</th>
                <th className="p-4">Họ Tên</th>
                <th className="p-4">MSSV</th>
                <th className="p-4">Khoa</th>
                <th className="p-4">Thanh toán</th>
                <th className="p-4">Trạng thái Check-in</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {currentAttendees.length > 0 ? (
                currentAttendees.map((attendee, index) => (
                  <tr key={attendee.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Chú ý: Cột STT tính toán lại để số đếm liên tục qua các trang */}
                    <td className="p-4 text-center text-gray-500 font-medium">{startIndex + index + 1}</td>
                    <td className="p-4 font-mono font-semibold text-gray-700">{attendee.ticketCode}</td>
                    <td className="p-4 font-semibold text-gray-900">{attendee.name || 'Chưa cập nhật'}</td>
                    <td className="p-4 text-gray-600 font-mono">{attendee.studentId || 'N/A'}</td>
                    <td className="p-4 text-gray-600">{attendee.faculty || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md border ${(attendee.paymentStatus || attendee.payment) === 'Đã thanh toán'
                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                        : 'bg-purple-50 text-purple-700 border-purple-100'
                        }`}>
                        {attendee.paymentStatus || attendee.payment || 'Miễn phí'}
                      </span>
                    </td>
                    <td className="p-4">
                      {attendee.isCheckedIn ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle size={14} className="text-green-500" /> Đã Check-in
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                          <XCircle size={14} className="text-gray-400" /> Chưa Check-in
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {!attendee.isCheckedIn ? (
                        <button
                          onClick={() => handleCheckIn(attendee.id)}
                          disabled={processingIds.includes(attendee.id)} // Khóa nút nếu ID đang nằm trong mảng
                          className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-lg transition-all transform whitespace-nowrap
        ${processingIds.includes(attendee.id)
                              ? 'bg-blue-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 hover:-translate-y-0.5'
                            }`}
                        >
                          {/* Hiện icon xoay xoay nếu đang xử lý */}
                          {processingIds.includes(attendee.id) ? (
                            <><Loader2 size={14} className="animate-spin" /> Đang xử lý</>
                          ) : (
                            'Check-in'
                          )}
                        </button>
                      ) : (
                        <span className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-gray-400 bg-gray-50 rounded-lg border border-gray-100 cursor-not-allowed">
                          Đã hoàn tất
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  {/* ĐÃ FIX LỖI SỚ TÁO QUÂN Ở ĐÂY: Bỏ flex ở <td>, lồng thẻ <div> vào trong */}
                  <td colSpan="8" className="p-12">
                    <div className="flex flex-col items-center justify-center text-gray-500 text-center">
                      <Search size={40} className="text-gray-300 mb-3" />
                      <p>Chưa có ai đăng ký hoặc không tìm thấy sinh viên nào.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

        </div>
        {/* COMPONENT PHÂN TRANG (PAGINATION) */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Hiển thị <span className="font-bold text-gray-900">{startIndex + 1}</span> đến <span className="font-bold text-gray-900">{Math.min(startIndex + itemsPerPage, filteredAttendees.length)}</span> trong số <span className="font-bold text-gray-900">{filteredAttendees.length}</span> sinh viên
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        )}
      </div>

    </div>

  );
};

export default AdminWorkshopAttendees;