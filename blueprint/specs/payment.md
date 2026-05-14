# Đặc tả: Luồng Thanh toán và Đăng ký (Payment & Registration)

## Mô tả
Xử lý nghiệp vụ cốt lõi: Sinh viên đăng ký tham gia workshop có phí, thanh toán qua mã QR, và hệ thống tự động xác nhận vé.

## Luồng chính
1. Sinh viên bấm "Đăng ký" tại trang chi tiết Workshop.
2. Hệ thống kiểm tra Rate Limit. Nếu pass, kiểm tra số chỗ trống bằng Optimistic Locking (`version` check).
3. Nếu còn chỗ, hệ thống sinh mã vé ảo `ticketCode` (VD: TK00010001ABCD) và gọi API/hàm sinh mã QR ngân hàng (SePay).
4. Mã QR được trả về Frontend. Sinh viên mở App ngân hàng quét mã, nội dung chuyển khoản tự động điền sẵn `ticketCode`.
5. Sau khi chuyển tiền, SePay gọi POST Webhook về Backend.
6. Backend trích xuất mã vé, kiểm tra chống trùng lặp (Idempotency). 
7. Lưu Ticket vào Database, tăng số vé đã đặt (Kích hoạt khóa Lạc quan Optimistic Locking chốt chặn cuối).
8. Kích hoạt Observer Pattern để gửi Email xác nhận cho sinh viên.

## Kịch bản lỗi
- **Tranh chấp chỗ ngồi (10 người mua 1 vé)**: 9 người thao tác chậm hơn vài mili-giây sẽ dính lỗi `ObjectOptimisticLockingFailureException`. Hệ thống trả về thông báo "Vé cuối cùng đã có người nhanh tay hơn".
- **Cổng thanh toán sập (Timeout)**: Resilience4j Circuit Breaker sẽ đóng cổng, kích hoạt hàm Fallback. Sinh viên sẽ nhận được chỗ (Trạng thái PENDING) kèm thông báo "Hệ thống thanh toán bảo trì, bạn đã được giữ chỗ và có thể thanh toán tại quầy".
- **Webhook gọi 2 lần**: Kiểm tra Idempotency thấy `ticketCode` đã tồn tại, lập tức báo HTTP 200 OK để bỏ qua và kết thúc.

## Ràng buộc
- Tuyệt đối không được xảy ra tình trạng "Overbooking" (Số vé bán ra lớn hơn số ghế của phòng học).
- Database luôn phải duy trì tính toàn vẹn thông qua cấu trúc `UniqueConstraint(user_id, workshop_id)`.

## Tiêu chí chấp nhận
- Dù có bao nhiêu request đồng thời, giới hạn sức chứa của Workshop phải được tuân thủ chính xác.
- Tiền của sinh viên chỉ được ghi nhận một lần duy nhất.
