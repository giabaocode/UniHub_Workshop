const API_URL = `${import.meta.env.VITE_API_BASE_URL}/users`;
const AUTH_API_URL = `${import.meta.env.VITE_API_BASE_URL}/auth`;
const UPLOAD_API_URL = `${import.meta.env.VITE_API_BASE_URL}/upload`;

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

const forgotPassword = async (email) => {
    const response = await fetch(`${AUTH_API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    // Safely parse JSON — body may be empty on some errors
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
        throw new Error(data.message || `Lỗi ${response.status}: Vui lòng thử lại sau.`);
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
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || 'Lỗi khi tải ảnh lên Cloudinary');
    }

    return { url: data.secure_url };
};

const userService = {
    getProfile,
    updateProfile,
    requestPasswordReset,
    forgotPassword,
    resetPassword,
    uploadAvatar
};

export default userService;
