import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
    }, []);

    const login = async (email, password) => {
        const data = await authService.login(email, password);
        setUser(data);
    };

    const register = async (fullName, email, password) => {
        const data = await authService.register(fullName, email, password);
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
        <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};