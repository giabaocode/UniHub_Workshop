import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/tickets`;

const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.token) throw new Error('Vui lòng đăng nhập để tiếp tục.');

    return {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    };
};

const parseResponseBody = async (response) => {
    const text = await response.text();
    if (!text) return {};

    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
};

const handleAuthFailure = (response) => {
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('user');
        throw new Error('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
    }
};

const getMyTickets = async () => {
    const response = await fetch(`${API_URL}/my-tickets`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    const data = await parseResponseBody(response);
    if (!response.ok) {
        handleAuthFailure(response);
        throw new Error(data.message || data.error || 'Không thể tải vé.');
    }
    return data;
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

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('user');
        }
        return { isRegistered: false };
    }
    return await parseResponseBody(response);
};

const getTicketStatus = async (ticketCode) => {
    const response = await fetch(`${API_URL}/status/${ticketCode}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    const data = await parseResponseBody(response);
    if (!response.ok) {
        handleAuthFailure(response);
        throw new Error(data.message || data.error || 'Không thể kiểm tra trạng thái thanh toán.');
    }

    return data;
};

const registerWorkshop = async (workshopId) => {
    const response = await fetch(`${API_URL}/register/${workshopId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });

    const data = await parseResponseBody(response);

    if (!response.ok) {
        console.warn("Backend Error Body:", data);
        handleAuthFailure(response);
        throw new Error(data.message || data.error || 'Có lỗi xảy ra từ phía Server');
    }
    
    return data;
};

const batchCheckIn = async (ticketCodes) => {
    const response = await fetch(`${API_URL}/batch-checkin`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        // ticketCodes là một mảng: ["TK00010002", "TK00050002"]
        body: JSON.stringify(ticketCodes), 
    });

    const data = await parseResponseBody(response);
    if (!response.ok) {
        handleAuthFailure(response);
        throw new Error(data.message || data.error || 'Lỗi khi đồng bộ check-in offline');
    }

    return data;
};

// ĐƯA OBJECT GOM NHÓM VÀ EXPORT XUỐNG DƯỚI CÙNG
const ticketService = {
    getMyTickets,
    checkRegistration,
    getTicketStatus,
    registerWorkshop,
    batchCheckIn
};

export default ticketService;
