const API_URL = 'http://localhost:8080/api/tickets';

const getMyTickets = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.token) {
        throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/my-tickets`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch tickets');
    }

    return await response.json();
};

const ticketService = {
    getMyTickets,
};

export default ticketService;
