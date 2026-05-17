import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

const tokens = new SharedArray('jwt tokens', function () {
  return JSON.parse(open('./tokens.json'));
});

export const options = {
  scenarios: {
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 12000 },
        { duration: '5m', target: 12000 },
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    // that bai neu ti le loi vuot 1%
    http_req_failed: ['rate<0.01'], 
    // 95% request phai hoan thanh duoi 2s
    http_req_duration: ['p(95)<2000'], 
  },
};

const BASE_URL = 'http://127.0.0.1:8081/api'; 
const WORKSHOP_ID = 1;

export default function () {
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