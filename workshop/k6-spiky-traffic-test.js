import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  scenarios: {
    // 60% truy cập trong 3 phút đầu (7200 users)
    spike_3_mins: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 2400 }, // Tăng nhanh trong 30s
        { duration: '2m', target: 4800 },  // Duy trì đỉnh điểm
        { duration: '30s', target: 0 },    // Giảm dần
      ],
      gracefulRampDown: '30s',
    },
    // 40% rải rác trong 7 phút sau (4800 users)
    steady_7_mins: {
      executor: 'ramping-vus',
      startTime: '3m', // Bắt đầu sau khi spike 3 phút kết thúc
      startVUs: 0,
      stages: [
        { duration: '1m', target: 1000 },
        { duration: '5m', target: 1000 },
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'], // Lỗi dưới 1%
    http_req_duration: ['p(95)<2000'], // 95% request phải hoàn thành dưới 2 giây
  },
};

const BASE_URL = 'http://localhost:8080/api';
const WORKSHOP_ID = 1; // Thay ID workshop bạn muốn test

// Mảng chứa các token đã được lấy từ trước (Bạn có thể gen sẵn và paste vào đây)
// Để kịch bản thực tế, script này sẽ tạo user ngẫu nhiên và lấy token ngay lúc chạy.
// LƯU Ý: Nếu tạo user ngay lúc chạy, database có thể bị nghẽn ở khâu Register. 
// Khuyến nghị tốt nhất: Tắt Security tạm thời cho Endpoint này khi Load Test, hoặc dùng data từ file CSV.

export default function () {
  // 1. (Tùy chọn) Bypass auth hoặc register user. 
  // Dưới đây là ví dụ tự động đăng ký 1 user giả mạo cho mỗi VU để lấy JWT.
  const randomEmail = `testuser_${randomString(10)}@example.com`;
  
  const regRes = http.post(`${BASE_URL}/auth/register`, JSON.stringify({
    fullName: 'Test User',
    email: randomEmail,
    password: 'password123',
    studentId: randomString(8)
  }), {
    headers: { 'Content-Type': 'application/json' }
  });

  let token = '';
  if (regRes.status === 200) {
    token = regRes.json('token');
  } else {
    // Fallback thử login nếu register lỗi
    const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
      email: randomEmail,
      password: 'password123'
    }), { headers: { 'Content-Type': 'application/json' }});
    if (loginRes.status === 200) token = loginRes.json('token');
  }

  if (!token) return; // Bỏ qua nếu không lấy được token

  // 2. Gửi request mua vé (Spam request để test Rate Limit)
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    // Giả lập các IP khác nhau nếu muốn bypass Rate Limit, 
    // Hoặc giữ nguyên để test xem hệ thống có chặn spam từ 1 IP hay không
    'X-Forwarded-For': `192.168.1.${Math.floor(Math.random() * 255)}` 
  };

  // Gửi dồn dập 6 requests liên tục để test Rate Limit (Tối đa 5 req/10s)
  for(let i=0; i<6; i++) {
    let res = http.post(`${BASE_URL}/tickets/register/${WORKSHOP_ID}`, null, { headers });
    
    check(res, {
      'is status 200 (Success)': (r) => r.status === 200,
      'is status 400 (Bad Request - Đã đăng ký/Hết vé)': (r) => r.status === 400,
      'is status 429 (Rate Limited)': (r) => r.status === 429,
    });
    
    // Nếu request đầu tiên thành công, ngưng spam để test user khác
    if (res.status === 200) break;
  }

  sleep(1);
}
