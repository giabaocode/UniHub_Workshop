import React, { useState } from 'react';
import ticketService from '../services/ticket.service';
import { RefreshCw } from 'lucide-react'; // Icon đồng bộ

const SyncOfflineButton = () => {
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSyncOfflineData = async () => {
        // 1. Lấy danh sách các mã vé đã quét offline từ LocalStorage
        // (Giả sử lúc mất mạng, bạn lưu mảng ["TK0001", "TK0002"] vào key 'offlineScannedTickets')
        const offlineTicketsStr = localStorage.getItem('offlineScannedTickets');
        const offlineTickets = offlineTicketsStr ? JSON.parse(offlineTicketsStr) : [];

        if (offlineTickets.length === 0) {
            alert("Không có dữ liệu quét offline nào cần đồng bộ.");
            return;
        }

        setIsSyncing(true);
        try {
            // 2. Gọi API Batch Check-in
            const result = await ticketService.batchCheckIn(offlineTickets);

            alert(`Đồng bộ thành công! Đã check-in ${result.newlyCheckedIn} / ${result.received} vé.`);

            // 3. Xóa dữ liệu tạm sau khi đồng bộ thành công lên server
            localStorage.removeItem('offlineScannedTickets');

            // (Optional) Gọi hàm fetchAttendees() để cập nhật lại danh sách trên màn hình

        } catch (error) {
            alert("Lỗi đồng bộ: " + error.message);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <button
            onClick={handleSyncOfflineData}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
            <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ dữ liệu Offline'}
        </button>
    );
};

export default SyncOfflineButton;