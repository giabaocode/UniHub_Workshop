const API_URL = 'http://localhost:8080/api/tickets';

const getMyTickets = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/my-tickets`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
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
        },
    });

    // Bước 1: Đọc dưới dạng Text trước
    const text = await response.text(); 
    
    // Bước 2: Chỉ parse nếu text không rỗng
    const data = text ? JSON.parse(text) : {}; 

    if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra từ phía Server');
    }
    
    return data;
};

const ticketService = {
    getMyTickets,
    checkRegistration,
    registerWorkshop
};

export default ticketService;