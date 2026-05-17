const WORKSHOP_ID = 45; // Đổi ID này thành ID của workshop chỉ còn 1 chỗ trống
const BASE_URL = 'http://localhost:8081/api';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function createAccountAndGetToken(index) {
    const email = `race_user_${Date.now()}_${index}@fpt.edu.vn`;
    const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fullName: `User Race ${index}`,
            email: email,
            password: "password123",
            studentId: `SE_TEST_${Date.now().toString().slice(-6)}${index}`
        })
    });
    
    if (!res.ok) {
        console.error(`Lỗi tạo user ${index}:`, await res.text());
        return null;
    }
    const data = await res.json();
    return data.token;
}

async function registerWorkshop(token, index) {
    const res = await fetch(`${BASE_URL}/tickets/register/${WORKSHOP_ID}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (res.ok) {
        console.log(`✅ [User ${index}] ĐĂNG KÝ THÀNH CÔNG! Đã cướp được vé.`);
    } else {
        const err = await res.json();
        console.log(`❌ [User ${index}] Thất bại: ${err.error || 'Đã hết chỗ'}`);
    }
}

async function runRaceConditionTest() {
    console.log("=== BẮT ĐẦU TEST RACE CONDITION (TRANH CHẤP CHỖ NGỒI) ===");
    console.log("1. Đang tạo 10 tài khoản ảo...");
    
    const tokens = [];
    for (let i = 1; i <= 10; i++) {
        const token = await createAccountAndGetToken(i);
        if (token) tokens.push(token);
    }
    
    console.log(`2. Đã chuẩn bị xong ${tokens.length} tài khoản. 3 giây nữa sẽ cùng lúc tấn công...`);
    await delay(3000);
    
    console.log("3. BẮN REQUEST CÙNG 1 MILI-GIÂY! 🚀🚀🚀");
    // Dùng Promise.all để gửi 10 request cùng một lúc (Concurrency)
    const requests = tokens.map((token, index) => registerWorkshop(token, index + 1));
    await Promise.all(requests);
    
    console.log("=== KẾT THÚC TEST ===");
    console.log("Nếu code chuẩn, chỉ duy nhất 1 User báo Thành công, còn lại phải báo thất bại.");
}

runRaceConditionTest();
