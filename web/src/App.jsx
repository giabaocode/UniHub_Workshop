import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import ProtectedRoute from './components/ProtectedRoute';

import { AuthProvider } from './context/authContext';

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
          
          {/* Các route có header */}
          <Route path="/" element={<MainLayout><StudentHome /></MainLayout>} />
          <Route path="/workshop/:id" element={<MainLayout><WorkshopDetail /></MainLayout>} />
          <Route path="/my-tickets" element={<ProtectedRoute><MainLayout><MyTickets /></MainLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><MainLayout><UserProfile /></MainLayout></ProtectedRoute>} />
          
          {/* Các route Admin (sử dụng AdminLayout riêng) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="create" element={<AdminCreateWorkshop />} />
            <Route path="workshop/:id/attendees" element={<AdminWorkshopAttendees />} />
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
