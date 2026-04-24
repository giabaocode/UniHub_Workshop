const API_URL = 'http://localhost:8080/api/auth';

const login = async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    }

    const data = await response.json();
    if (data.token) {
        localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
};

const register = async (fullName, email, password) => {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, password }),
    });

    if (!response.ok) {
        throw new Error('Đăng ký thất bại. Email có thể đã tồn tại.');
    }

    const data = await response.json();
    if (data.token) {
        localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
};

const logout = () => {
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const authService = {
    register,
    login,
    logout,
    getCurrentUser,
};

export default authService;
