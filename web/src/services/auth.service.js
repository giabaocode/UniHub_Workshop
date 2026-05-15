import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/auth`;

const login = async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true' // Vượt tường Ngrok
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

const register = async (fullName, email, password, studentId, faculty) => {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ fullName, email, password, studentId, faculty }),
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

const googleLogin = async (credential) => {
    const response = await fetch(`${API_URL}/google`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ token: credential }),
    });

    if (!response.ok) {
        throw new Error('Đăng nhập bằng Google thất bại.');
    }

    const data = await response.json();
    if (data.token) {
        localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
};

const githubLogin = async (code) => {
    const response = await fetch(`${API_URL}/github`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ code }),
    });

    if (!response.ok) {
        throw new Error('Đăng nhập bằng GitHub thất bại.');
    }

    const data = await response.json();
    if (data.token) {
        localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const authService = {
    register,
    login,
    googleLogin,
    githubLogin,
    logout,
    getCurrentUser,
};

export default authService;
