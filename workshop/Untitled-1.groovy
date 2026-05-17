import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

// 1. Đọc file tokens.json ĐÚNG 1 LẦN vào bộ nhớ dùng chung
const tokens = new SharedArray('jwt tokens', function () {
  return JSON.parse(open('./tokens.json'));
});

// 2. Cấu hình kịch bản test 10.000 VUs
export const options = {
  scenarios: {
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        // Bơm từ 0 lên 10.000 user từ từ trong 3 phút (Tránh sốc mạng)
        { duration: '1m', target: 12000 },
        // Giữ vững mức 10.000 user strong 5 phút
        { duration: '5m', target: 12000 },
        // Hạ nhiệt dần về 0 trong 1 phút
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    // Kịch bản thất bại nếu tỉ lệ lỗi vượt 1%
    http_req_failed: ['rate<0.01'], 
    // 95% request phải hoàn thành dưới 2 giây
    http_req_duration: ['p(95)<2000'], 
  },
};

const BASE_URL = 'http://127.0.0.1:8081/api'; // Nhớ trỏ đúng port Spring Boot
const WORKSHOP_ID = 1;

// 3. Hành động của từng User Ảo
export default function () {
  // Bốc ngẫu nhiên 1 token từ mảng data đã nạp
  const randomToken = tokens[Math.floor(Math.random() * tokens.length)];

  const headers = {
    'Authorization': `Bearer ${randomToken}`,
    'Content-Type': 'application/json',
  };

  // Bắn request (Ví dụ: Gọi API mua vé)
  const res = http.post(`${BASE_URL}/tickets/register/${WORKSHOP_ID}`, null, { headers });
    
  // Kiểm tra kết quả trả về
  check(res, {
    'is status 200 (Success)': (r) => r.status === 200,
    'is status 400 (Bad Request - Hết vé)': (r) => r.status === 400,
  });

  // QUAN TRỌNG: Phải có sleep(1) để mô phỏng người thật (Nghỉ 1 giây trước khi click tiếp).
  // Nếu không có sleep, k6 sẽ bắn request liên tục dạng vòng lặp vô hạn, tạo thành DDoS.
  sleep(1);
}