# Cấu trúc dự án UniHub Workshop

Dự án này được thiết kế theo Kiến trúc 3 lớp (Layered Architecture). Dưới đây là mục đích của từng package trong dự án để mọi người dễ dàng theo dõi:

- **`controller`**: Chứa các REST API Controller. Đây là nơi tiếp nhận các HTTP Request từ client và trả về HTTP Response.
- **`service`**: Chứa các interface và class xử lý logic nghiệp vụ (Business Logic). Controller sẽ gọi đến Service để thực hiện các yêu cầu.
- **`repository`**: Chứa các interface giao tiếp với Database (thường kế thừa từ JpaRepository). Service sẽ gọi đến Repository để lấy hoặc lưu dữ liệu.
- **`entity`**: Chứa các mô hình dữ liệu (Data Models) được ánh xạ trực tiếp với các bảng trong Database (thường sử dụng JPA/Hibernate).
- **`dto`**: Chứa các đối tượng truyền dữ liệu (Data Transfer Objects). DTO được sử dụng để truyền dữ liệu giữa client và server hoặc giữa các lớp với nhau, giúp ẩn đi cấu trúc Entity thực tế.
- **`config`**: Chứa các class cấu hình hệ thống (ví dụ: cấu hình bảo mật Spring Security, xử lý CORS, cấu hình Swagger/OpenAPI).
- **`exception`**: Chứa các class xử lý lỗi chung (Global Exception Handling). Giúp bắt và xử lý các ngoại lệ (Exception) một cách tập trung và trả về response lỗi chuẩn mực cho client.
