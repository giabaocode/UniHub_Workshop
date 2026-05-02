import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import StudentHome from './pages/StudentHome';
import WorkshopDetail from './pages/WorkshopDetail';
import MyTickets from './pages/MyTickets';
import AdminCreateWorkshop from './pages/AdminCreateWorkshop';
import AdminDashboard from './pages/AdminDashboard';
import AdminWorkshopAttendees from './pages/AdminWorkshopAttendees';
import AdminStaffManagement from './pages/AdminStaffManagement';
import AdminSettings from './pages/AdminSettings';
import UserProfile from './pages/UserProfile';
import AdminLayout from './components/AdminLayout';
import NotFound from './pages/NotFound';
import AuthPage from './pages/AuthPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import GithubCallback from './pages/GithubCallback';
import ProtectedRoute from './components/ProtectedRoute';
import CheckInPage from './pages/CheckInPage';
import AdminEditWorkshop from './pages/AdminEditWorkshop'; // Nhớ import ở đầu file

import { AuthProvider } from './context/authContext';
import { useContext } from 'react';
import { AuthContext } from './context/authContext';

// Redirect Admin/Staff ra đúng trang khi vào '/'
const HomeRedirect = () => {
  const { user } = useContext(AuthContext);
  if (user?.role?.trim() === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user?.role?.trim() === 'STAFF') return <Navigate to="/checkin" replace />;
  return <MainLayout><StudentHome /></MainLayout>;
};

// Wrapper layout for pages with header
const MainLayout = ({ children }) => (
  <div className="antialiased text-gray-900 flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Route không có header */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/github/callback" element={<GithubCallback />} />
          <Route path="/checkin" element={<ProtectedRoute><CheckInPage /></ProtectedRoute>} />
          

          {/* Các route có header */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/workshop/:id" element={<MainLayout><WorkshopDetail /></MainLayout>} />
          <Route path="/my-tickets" element={<ProtectedRoute><MainLayout><MyTickets /></MainLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><MainLayout><UserProfile /></MainLayout></ProtectedRoute>} />

          {/* Các route Admin (sử dụng AdminLayout riêng) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="create" element={<AdminCreateWorkshop />} />
            <Route path="workshop/:id/attendees" element={<AdminWorkshopAttendees />} />
            <Route path="/admin/edit/:id" element={<AdminEditWorkshop />} />
            <Route path="staff" element={<AdminStaffManagement />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>

          <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
