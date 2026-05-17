# UniHub Workshop

UniHub Workshop is a React/Vite PWA frontend with a Spring Boot backend for workshop registration, paid tickets, QR check-in, admin management, CSV student sync, Cloudinary uploads, and AI workshop summaries.

## Requirements

- JDK 21+
- Node.js 18+
- PostgreSQL
- Redis (recommended for production rate limiting; backend will fall back to in-memory if Redis is offline)

## Secrets / Environment

Tất cả thông tin nhạy cảm (DB password, OAuth secret, mail password, Gemini key…) đều được đọc từ biến môi trường. KHÔNG hardcode trong source.

### Backend

Tham khảo template:

```
workshop/src/main/resources/application.properties.example
```

Các biến quan trọng cần set trước khi chạy production:

| Biến                                                                 | Mô tả                                                      |
| -------------------------------------------------------------------- | ---------------------------------------------------------- |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`                               | Postgres connection                                        |
| `JWT_SECRET`                                                         | Khóa ký JWT (>= 256 bit, random)                           |
| `GOOGLE_CLIENT_ID` / `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`     | OAuth                                                      |
| `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`                        | Gmail App Password                                         |
| `GEMINI_API_KEY`                                                     | AI summary (chỉ ở backend, không bao giờ expose ra client) |
| `RATE_LIMIT_ENABLED`, `RATE_LIMIT_STORE`, `REDIS_HOST`, `REDIS_PORT` | Distributed rate limit                                     |
| `SEPAY_ACCOUNT`, `SEPAY_BANK`                                        | Cấu hình QR thanh toán                                     |

### Frontend

Xem `web/.env.example`. Lưu ý: chỉ public values (`VITE_*`) mới được đặt ở client. Gemini API key đã chuyển hoàn toàn sang backend.

## Backend

```bash
cd workshop
./mvnw spring-boot:run
```

Backend chạy ở `http://localhost:8081`.

`workshop/students.csv` là file CSV dùng cho job đồng bộ sinh viên hàng đêm (đã `.gitignore`).

## Frontend

```bash
cd web
cp .env.example .env
npm install
npm run dev
```

## Bảo mật & RBAC

- `/api/notifications/stream` chỉ ADMIN, `stream-user` chỉ user đã đăng nhập, mark-as-read kiểm tra ownership.
- Batch check-in, list attendees, manual check-in chỉ cho ADMIN/STAFF (cả ở `@PreAuthorize` lẫn `SecurityFilterChain`).
- Tất cả API mutating workshop yêu cầu role ADMIN.
- AI endpoints `/api/admin/ai/**` chỉ ADMIN.
- Frontend `<ProtectedRoute roles={...}>` block hard-redirect nếu user không đủ quyền (defensive UX), nhưng auth thật vẫn nằm ở backend.

## Hủy workshop

Admin có nút "Hủy sự kiện" trên dashboard:

- Sự kiện soft-cancel (`status=CANCELLED`, `cancelledAt`, `cancellationReason`).
- Mọi vé hợp lệ (`PENDING/PAID/PAY_AT_COUNTER`) chuyển sang `CANCELLED`.
- Vé đã thanh toán log RefundLog để tài chính xử lý hoàn tiền.
- Sinh viên nhận thông báo qua email + in-app + telegram (nếu enabled).
- Banner "Sự kiện đã bị hủy" hiển thị ở trang detail và Vé của tôi.

## Verification

```bash
cd web && npm run build
cd workshop && ./mvnw -q -DskipTests compile
```
