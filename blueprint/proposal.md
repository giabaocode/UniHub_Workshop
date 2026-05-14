# UniHub Workshop — Project Proposal

## Vấn đề
Hiện tại, trường Đại học tổ chức "Tuần lễ kỹ năng và nghề nghiệp" với quy mô lớn, gồm hàng chục workshop diễn ra song song. Tuy nhiên, khâu tổ chức đang gặp các vấn đề nghiêm trọng:
- **Quản lý thủ công**: Đăng ký qua Google Form, gửi email xác nhận bằng tay gây tốn thời gian và dễ sai sót.
- **Quá tải và xung đột**: Google Form không có cơ chế chốt số lượng realtime chính xác. Khi nhiều sinh viên cùng đăng ký vé cuối cùng, tình trạng bán lố vé (overbooking) thường xuyên xảy ra.
- **Check-in ùn tắc**: Nhân sự điểm danh bằng giấy hoặc tra file Excel làm dòng người kẹt cứng trước cửa phòng hội trường. Nếu mất WiFi, công tác điểm danh tê liệt.
- **Rủi ro tài chính**: Sinh viên chuyển khoản nhầm, hoặc cổng thanh toán chậm trễ gây trừ tiền nhiều lần mà không nhận được vé.

## Mục tiêu
Xây dựng một hệ thống **UniHub Workshop** số hóa toàn bộ quy trình:
- **Tự động hóa**: Từ lúc sinh viên đăng ký, thanh toán tự động, nhận vé QR qua email, cho đến lúc quét mã check-in.
- **Hiệu năng cao**: Chịu tải được 12.000 sinh viên truy cập đồng loạt trong 10 phút đầu mở đăng ký mà không sập hệ thống.
- **Độ tin cậy (Reliability)**: Chống overbooking, chống trừ tiền 2 lần, và đặc biệt là hệ thống vẫn hoạt động (Graceful Degradation) kể cả khi cổng thanh toán ngân hàng bảo trì, hoặc nhân viên check-in bị mất mạng.

## Người dùng và nhu cầu
1. **Sinh viên**: 
   - Xem lịch các workshop sắp tới.
   - Tranh vé nhanh chóng, thanh toán dễ dàng.
   - Có mã vé QR lưu trong máy để check-in.
2. **Ban tổ chức (Admin)**: 
   - Quản lý danh sách sự kiện, sửa/hủy/cập nhật thông tin nhanh chóng.
   - Thống kê tự động số vé bán ra, số tiền thu về.
   - Có công cụ AI hỗ trợ tóm tắt tài liệu Workshop nhanh chóng.
3. **Nhân sự check-in (Staff)**:
   - Dùng điện thoại cá nhân (App/Web PWA) quét QR nhanh.
   - Quét được ngay cả khi ở các khu vực hội trường sóng yếu/mất mạng.

## Phạm vi
- **Trong phạm vi đồ án**: Hệ thống Backend (Spring Boot), Frontend PWA (React), tích hợp thanh toán (SePay Webhook), tích hợp AI (Google Gemini), cơ chế Rate Limiting (Redis), Fallback Pattern (Graceful Degradation).
- **Ngoài phạm vi**: Tích hợp trực tiếp vào hệ thống quản lý đào tạo cốt lõi của trường (FAP), cổng thanh toán nội địa chuyên biệt (VNPay/Momo) thay vì dùng SePay.

## Rủi ro và ràng buộc
- **Tranh chấp chỗ ngồi (Concurrency)**: Khi nhiều client giành nhau 1 slot cuối.
- **Tải đột biến (Spike Load)**: Bot hoặc hàng ngàn người truy cập F5 liên tục.
- **Cổng thanh toán không ổn định**: API ngân hàng có thể timeout bất cứ lúc nào.
- **Tích hợp một chiều CSV**: Phải đồng bộ sinh viên từ file text do hệ thống cũ xuất ra ban đêm.
- **Mất kết nối mạng tại sự kiện**: Nhân viên không có 4G khi đang check-in.
