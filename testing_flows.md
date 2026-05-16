# Danh sách các kịch bản kiểm thử (Testing Flows) - UniHub Workshop

Dựa vào các yêu cầu trong `project_spec.txt` (đã bỏ qua phần tải trọng 12.000 users), dưới đây là các luồng kiểm thử quan trọng nhất để đánh giá độ hoàn thiện và khả năng xử lý các vấn đề kỹ thuật khó của hệ thống:

## 1. Flow Tranh chấp chỗ ngồi (Race Conditions)
> [!IMPORTANT]
> Đây là tiêu chí cốt lõi trong đồ án để đánh giá khả năng xử lý đa luồng của database.

*   **Mục đích:** Đảm bảo không có hiện tượng "Overselling" (bán lố vé) khi nhiều người đăng ký cùng một lúc.
*   **Thiết lập:**
    *   Tạo một workshop có giới hạn số lượng (ví dụ: chỉ còn **1 chỗ trống** cuối cùng).
*   **Các bước test:**
    *   Sử dụng công cụ (như Postman Runner, K6 với số lượng nhỏ khoảng 10-20 requests, hoặc dùng script Python/JS) gửi yêu cầu đăng ký **cùng một phần nghìn giây** cho 10 sinh viên khác nhau vào workshop này.
*   **Kết quả mong đợi:**
    *   Chỉ có duy nhất **1 request thành công**.
    *   9 request còn lại nhận được thông báo lỗi "Đã hết chỗ".
    *   Trường `booked_spots` trong database không vượt quá `capacity`.

## 2. Flow Thanh toán lỗi & Circuit Breaker
> [!WARNING]
> Đánh giá khả năng sinh tồn của hệ thống khi dịch vụ bên thứ 3 (cổng thanh toán) bị sập.

*   **Mục đích:** Đảm bảo khi cổng thanh toán lỗi hoặc chậm, toàn bộ ứng dụng UniHub không bị treo theo.
*   **Thiết lập:** 
    *   Đăng ký một workshop có phí.
    *   Sửa cấu hình hoặc ngắt mạng tạm thời để mô phỏng API thanh toán (SePay/VNPay) bị timeout.
*   **Các bước test:**
    *   Sinh viên bấm "Thanh toán". Lệnh gọi API sẽ bị treo.
    *   Cùng lúc đó, sinh viên khác truy cập trang chủ để xem danh sách workshop.
*   **Kết quả mong đợi:**
    *   Luồng thanh toán thất bại sau thời gian timeout (hoặc trả về lỗi từ Circuit Breaker).
    *   Vé của sinh viên được lưu ở trạng thái `PENDING` (chờ thanh toán sau), không bị mất dữ liệu.
    *   **Quan trọng:** Trang chủ và các chức năng khác vẫn phản hồi cực nhanh, không bị ảnh hưởng bởi luồng thanh toán đang bị nghẽn.

## 3. Flow Tính bất biến (Idempotency - Chống trừ tiền 2 lần)
> [!CAUTION]
> Sinh viên hay có thói quen bấm nút "Thanh toán" hoặc "Đăng ký" liên tục khi mạng lag.

*   **Mục đích:** Đảm bảo một hành động dù được gửi đi gửi lại nhiều lần vẫn chỉ sinh ra một kết quả duy nhất.
*   **Các bước test:**
    *   Bắt lại (intercept) request thanh toán/xác nhận vé của một sinh viên (có chứa `Idempotency-Key` hoặc `TicketCode`).
    *   Bắn lại request này 5 lần liên tục.
*   **Kết quả mong đợi:**
    *   Lần đầu tiên xử lý bình thường.
    *   4 lần sau hệ thống nhận diện được mã trùng lặp và bỏ qua xử lý logic (không trừ thêm ghế, không gửi thêm email), chỉ trả về kết quả giống hệt lần 1.

## 4. Flow Check-in Offline (Mobile App / Nhân sự)
> [!NOTE]
> Giải quyết bài toán khu vực hội trường bị rớt sóng Wifi.

*   **Mục đích:** Nhân sự vẫn có thể quét QR Code cho sinh viên vào cổng khi không có internet.
*   **Các bước test:**
    *   Đăng nhập tài khoản Nhân sự check-in trên thiết bị (hoặc trình duyệt có mô phỏng PWA).
    *   **Tắt Wifi / Chuyển sang chế độ Airplane Mode.**
    *   Quét 3 mã QR của 3 sinh viên hợp lệ.
    *   Mở Wifi trở lại.
*   **Kết quả mong đợi:**
    *   Khi mất mạng, hệ thống vẫn báo "Check-in thành công" (lưu vào IndexedDB/Local Storage) mà không báo lỗi mạng.
    *   Khi có mạng, hệ thống phát hiện kết nối và tự động gửi 3 lượt check-in này lên server backend.
    *   Kiểm tra database: Trạng thái vé của 3 sinh viên chuyển thành `CHECKED_IN`.

## 5. Flow Quản trị & AI Summary (Ban tổ chức)
*   **Mục đích:** Kiểm tra luồng làm việc của admin và tính năng tích hợp AI.
*   **Các bước test:**
    *   Đăng nhập bằng tài khoản Ban tổ chức.
    *   Vào trang tạo mới Workshop. Upload một file PDF giới thiệu sự kiện.
*   **Kết quả mong đợi:**
    *   Hệ thống đọc PDF thành công, gửi nội dung lên Gemini AI.
    *   Giao diện tự động điền phần Tóm tắt ngắn, Tóm tắt chi tiết và các Hashtags một cách hợp lý. Không gặp lỗi xác thực OAuth.

## 6. Flow Đồng bộ CSV "Lì lợm" (Fault Tolerance)
*   **Mục đích:** Xử lý việc đồng bộ dữ liệu sinh viên không bao giờ bị gián đoạn vì lỗi dữ liệu rác.
*   **Thiết lập:**
    *   Tạo file `students.csv` có 10 dòng. Cố tình làm sai định dạng dòng số 5 (thiếu cột, email sai format).
*   **Các bước test:**
    *   Chạy Job đồng bộ CSV (hoặc chờ đến giờ).
*   **Kết quả mong đợi:**
    *   Hệ thống không bị crash. 
    *   9 dòng đúng được insert/update vào database thành công.
    *   Dòng số 5 bị bỏ qua, ghi lỗi rõ ràng ra log backend.

## 7. Flow Thông báo đa kênh (Email QR Code)
*   **Mục đích:** Trải nghiệm người dùng xuyên suốt.
*   **Các bước test:**
    *   Sinh viên đăng ký workshop thành công.
    *   Mở hộp thư email thực tế đã đăng ký.
*   **Kết quả mong đợi:**
    *   Nhận được email ngay lập tức với template HTML đẹp mắt.
    *   Hình ảnh QR Code được hiển thị trực tiếp trong email để có thể quét luôn mà không cần ấn link vào website.
