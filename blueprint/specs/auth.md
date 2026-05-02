# Đặc tả: Phân quyền & Xác thực (Auth)

## Mô tả
Quản lý quyền truy cập của người dùng (Sinh viên, Admin) vào các tài nguyên của hệ thống UniHub Workshop, đảm bảo đúng người, đúng chức năng.

## Luồng chính
1. Người dùng đăng nhập qua Google OAuth2 hoặc qua Form (Email/Password).
2. Backend xác thực, nếu đúng sẽ sinh ra một chuỗi JSON Web Token (JWT) chứa thông tin `UserId` và `Role` (ADMIN hoặc STUDENT).
3. Frontend lưu JWT này vào LocalStorage/Cookies.
4. Ở các request tiếp theo, Frontend tự động đính kèm token vào HTTP Header `Authorization: Bearer <token>`.
5. Spring Boot dùng `JwtAuthenticationFilter` để chặn request, giải mã JWT. Dựa vào Role, hệ thống quyết định cho đi tiếp hay chặn lại.

## Kịch bản lỗi
- **Token hết hạn hoặc sai định dạng**: Hệ thống từ chối bằng mã `HTTP 401 Unauthorized`. Frontend bắt lỗi này và đẩy về trang đăng nhập.
- **Vượt quyền (Ví dụ: Sinh viên gọi API Admin)**: Hệ thống từ chối bằng mã `HTTP 403 Forbidden`.

## Ràng buộc
- Mật khẩu của người dùng phải được mã hoá (Hash) bằng chuẩn `BCrypt` trước khi ghi vào Database. Không lưu plain-text.
- Các API tĩnh (Ảnh, CSS, HTML) và Webhook từ bên thứ 3 phải được cho qua (PermitAll) mà không cần JWT.

## Tiêu chí chấp nhận
- Giao diện Admin chỉ được hiển thị khi người dùng có role ADMIN.
- Nếu sinh viên cố tình dùng Postman và truyền Token của mình vào API tạo Workshop mới, Backend phải block request đó.
