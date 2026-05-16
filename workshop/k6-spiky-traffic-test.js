import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    // 60% truy cập trong 3 phút đầu: 7.200 sinh viên / 180s = 40 lượt/s
    spike_3_mins: {
      executor: 'constant-arrival-rate',
      rate: 7200,
      timeUnit: '3m',
      duration: '3m',
      preAllocatedVUs: 300,
      maxVUs: 1500,
      exec: 'registerOnce',
    },
    // 40% còn lại trong 7 phút sau: 4.800 sinh viên / 420s ~= 11,4 lượt/s
    steady_7_mins: {
      executor: 'constant-arrival-rate',
      startTime: '3m',
      rate: 4800,
      timeUnit: '7m',
      duration: '7m',
      preAllocatedVUs: 100,
      maxVUs: 800,
      exec: 'registerOnce',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'], // Lỗi dưới 1%
    http_req_duration: ['p(95)<2000'], // 95% request phải hoàn thành dưới 2 giây
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8081/api';
const WORKSHOP_ID = Number(__ENV.WORKSHOP_ID || 1);
const PASSWORD = 'password123';

function randomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let value = '';
  for (let i = 0; i < length; i++) {
    value += chars[Math.floor(Math.random() * chars.length)];
  }
  return value;
}

export function registerOnce() {
  // Mỗi iteration đại diện cho 1 sinh viên: tạo tài khoản test, lấy JWT, rồi bấm đăng ký 1 lần.
  // Nếu muốn đo riêng endpoint /tickets/register, hãy chuẩn bị sẵn token và bỏ bước /auth/register.
  const randomEmail = `load_${Date.now()}_${__ITER}_${randomString(8)}@example.com`;
  
  const regRes = http.post(`${BASE_URL}/auth/register`, JSON.stringify({
    fullName: 'Test User',
    email: randomEmail,
    password: PASSWORD,
    studentId: `LOAD_${randomString(12)}`
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
      password: PASSWORD
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

  const res = http.post(`${BASE_URL}/tickets/register/${WORKSHOP_ID}`, null, { headers });

  check(res, {
    'registered or business rejected': (r) => [200, 400, 429].includes(r.status),
    'no server error': (r) => r.status < 500,
  });

  sleep(1);
}
