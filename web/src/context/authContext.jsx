import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => authService.getCurrentUser());

    const updateUser = (updatedFields) => {
        const newUser = { ...user, ...updatedFields };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const login = async (email, password) => {
        const data = await authService.login(email, password);
        setUser(data);
    };

    const register = async (fullName, email, password) => {
        const data = await authService.register(fullName, email, password);
        setUser(data);
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

    return (
        <AuthContext.Provider value={{ user, updateUser, login, googleLogin, githubLogin, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
