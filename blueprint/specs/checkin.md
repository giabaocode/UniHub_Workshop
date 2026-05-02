# Đặc tả: Luồng Check-in Offline

## Mô tả
Hỗ trợ Ban Tổ Chức (Staff) điểm danh sinh viên bằng cách quét mã QR trên điện thoại di động thông qua ứng dụng Web (PWA). Cốt lõi của tính năng là đảm bảo quá trình kiểm vé không bị gián đoạn ngay cả khi nhân viên đứng ở các khu vực góc khuất, mất sóng WiFi/4G.

## Luồng chính
1. Nhân sự truy cập trang Quản lý Sinh viên và mở chế độ quét mã QR.
2. Quét mã QR trên vé của sinh viên (đã gửi qua email/app).
3. Nếu thiết bị đang có mạng (Online): Gửi API `PUT /api/checkin/{id}`, Backend đánh dấu vé là `isScanned = true`. UI cập nhật màu xanh lá.
4. Nếu thiết bị mất kết nối mạng (Offline): Trình duyệt bắt được lỗi rớt mạng. Thay vì quăng lỗi màn hình đỏ, ứng dụng đẩy mã vé vào bộ nhớ đệm `LocalStorage` của trình duyệt điện thoại. UI vẫn cập nhật màu xanh báo "Thành công (Chế độ Offline)".
5. Sinh viên tiếp tục đi vào cửa hội trường mà không bị kẹt lại.
6. Khi điện thoại của nhân sự có mạng trở lại, Event Listener `online` của trình duyệt sẽ phát giác. Hệ thống lôi toàn bộ mã vé nằm trong `LocalStorage` ra, đồng bộ ngầm (Background Sync) lên Backend, sau đó tự động dọn dẹp bộ nhớ đệm.

## Kịch bản lỗi
- **Quét sai QR**: Hệ thống báo "Mã vé không hợp lệ" ngay trên máy (vì định dạng mã vé không đúng chuẩn).
- **Lỗi đồng bộ khi có mạng**: Nếu đang chạy vòng lặp đồng bộ mà lại mất mạng tiếp, hoặc Server lỗi nội bộ (500), các mã vé lỗi vẫn được bảo lưu an toàn trong `LocalStorage`. Nó sẽ thử lại ở chu kỳ có mạng tiếp theo.

## Ràng buộc
- Phải có tín hiệu Cảnh báo (Cờ nhấp nháy đỏ trên màn hình) để nhân sự nhận thức được mình đang hoạt động ở chế độ Offline.

## Tiêu chí chấp nhận
- Tắt WiFi thiết bị di động, quét mã QR vẫn báo thành công và người dùng được phép đi qua.
- Mở WiFi lại, dữ liệu được chuyển lên Database. Admin dùng máy tính bàn (đang có mạng) F5 trang sẽ thấy thông tin check-in mới nhất vừa được đồng bộ.
