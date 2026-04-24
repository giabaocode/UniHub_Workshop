const API_URL = 'http://localhost:8080/api/users';
const AUTH_API_URL = 'http://localhost:8080/api/auth';
const UPLOAD_API_URL = 'http://localhost:8080/api/upload';

const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return { 'Authorization': `Bearer ${user.token}` };
    }
    return {};
};

const getProfile = async () => {
    const response = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Không thể tải thông tin cá nhân');
    }

    return await response.json();
};

const updateProfile = async (profileData) => {
    const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
    });

    if (!response.ok) {
        throw new Error('Lỗi khi cập nhật thông tin cá nhân');
    }

    return await response.json();
};

const requestPasswordReset = async () => {
    const response = await fetch(`${AUTH_API_URL}/reset-password-request`, {
        method: 'POST',
        headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi yêu cầu đổi mật khẩu');
    }

    return data;
};

const resetPassword = async (token, newPassword) => {
    const response = await fetch(`${AUTH_API_URL}/reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi đổi mật khẩu');
    }

    return data;
};

const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${UPLOAD_API_URL}/avatar`, {
        method: 'POST',
        headers: getAuthHeader(), // Do not set Content-Type, fetch will set it automatically with boundary for FormData
        body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi tải ảnh lên');
    }

    return data;
};

const userService = {
    getProfile,
    updateProfile,
    requestPasswordReset,
    resetPassword,
    uploadAvatar
};

export default userService;
