const API_URL = `${import.meta.env.VITE_API_BASE_URL}/tickets`;

const getMyTickets = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/my-tickets`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        },
    });

    if (!response.ok) throw new Error('Failed to fetch tickets');
    return await response.json();
};

const checkRegistration = async (workshopId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) return { isRegistered: false };

    const response = await fetch(`${API_URL}/check-registration/${workshopId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        },
    });

    if (!response.ok) return { isRegistered: false };
    return await response.json();
};

const registerWorkshop = async (workshopId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await fetch(`${API_URL}/register/${workshopId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        },
    });

    // Bước 1: Đọc dưới dạng Text trước
    const text = await response.text(); 
    
    // Bước 2: Chỉ parse nếu text không rỗng
    const data = text ? JSON.parse(text) : {}; 

    if (!response.ok) {
        console.warn("Backend Error Body:", data);
        throw new Error(data.error || data.message || 'Có lỗi xảy ra từ phía Server');
    }
    
    return data;
};

const batchCheckIn = async (ticketCodes) => {
    // 1. Lấy token của nhân sự/admin đang đăng nhập
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) throw new Error('Chưa đăng nhập');

    // 2. Gửi request PUT với mảng các ticketCodes
    const response = await fetch(`${API_URL}/batch-checkin`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
        },
        // ticketCodes là một mảng: ["TK00010002", "TK00050002"]
        body: JSON.stringify(ticketCodes), 
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Lỗi khi đồng bộ check-in offline');
    }

    return await response.json();
};

// ĐƯA OBJECT GOM NHÓM VÀ EXPORT XUỐNG DƯỚI CÙNG
const ticketService = {
    getMyTickets,
    checkRegistration,
    registerWorkshop,
    batchCheckIn
};

export default ticketService;