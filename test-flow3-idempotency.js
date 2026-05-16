const WORKSHOP_ID = 32; // Đổi ID này thành ID của workshop bạn muốn test
const BASE_URL = 'http://localhost:8081/api';

async function runIdempotencyTest() {
    console.log("=== BẮT ĐẦU TEST IDEMPOTENCY (CHỐNG TRÙNG LẶP / CLICK NHIỀU LẦN) ===");
    
    // 1. Tạo 1 tài khoản
    const email = `spam_user_${Date.now()}@fpt.edu.vn`;
    console.log(`1. Đang tạo tài khoản ${email}...`);
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fullName: `Spam User`,
            email: email,
            password: "password123",
            studentId: `SE_TEST_${Math.floor(Math.random() * 1000000)}`
        })
    });
    
    const token = (await regRes.json()).token;
    
    console.log("2. Giả lập người dùng bị lag mạng, bấm nút đăng ký 5 lần liên tục cùng 1 lúc...");
    
    // Gửi 5 request giống hệt nhau cùng một lúc
    const requests = [];
    for(let i = 1; i <= 5; i++) {
        requests.push(
            fetch(`${BASE_URL}/tickets/register/${WORKSHOP_ID}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }).then(async (res) => {
                if (res.ok) {
                    console.log(`[Request ${i}] ✅ Lần đầu đăng ký THÀNH CÔNG.`);
                } else {
                    const err = await res.json();
                    console.log(`[Request ${i}] ❌ Bị chặn lại: ${err.error}`);
                }
            })
        );
    }
    
    await Promise.all(requests);
    console.log("=== KẾT THÚC TEST ===");
    console.log("Nếu code chuẩn, chỉ có 1 request Thành công, 4 request kia phải bị báo lỗi 'Bạn đã đăng ký'.");
}

runIdempotencyTest();
