import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => authService.getCurrentUser());

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
    }, []);
    const login = async (email, password) => {
        const data = await authService.login(email, password);
        setUser(data);
        return data; // <--- THÊM DÒNG NÀY ĐỂ TRANG AUTHPAGE BIẾT LÀ AI ĐANG ĐĂNG NHẬP
    };

    const register = async (fullName, email, password, studentId, faculty) => {
        const data = await authService.register(fullName, email, password, studentId, faculty);
        setUser(data);
        return data; // <--- Thêm luôn cho đồng bộ
    };

    const googleLogin = async (credential) => {
        const data = await authService.googleLogin(credential);
        setUser(data);
    };

    const githubLogin = async (code) => {
        const data = await authService.githubLogin(code);
        setUser(data);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    // --- HÀM MỚI: CẬP NHẬT THÔNG TIN NGƯỜI DÙNG NGAY LẬP TỨC ---
    const updateUser = (newUserData) => {
        // Lấy dữ liệu user hiện tại từ State
        setUser(prevUser => {
            const updated = { ...prevUser, ...newUserData };
            // Lưu lại vào localStorage để F5 không bị mất
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{ user, updateUser, login, googleLogin, githubLogin, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};