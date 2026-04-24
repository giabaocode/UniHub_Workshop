import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import StudentHome from './pages/StudentHome';
import WorkshopDetail from './pages/WorkshopDetail';
import MyTickets from './pages/MyTickets';
import AdminCreateWorkshop from './pages/AdminCreateWorkshop';
import NotFound from './pages/NotFound';
import AuthPage from './pages/AuthPage';

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
    <Router>
      <Routes>
        {/* Route không có header */}
        <Route path="/login" element={<AuthPage />} />
        
        {/* Các route có header */}
        <Route path="/" element={<MainLayout><StudentHome /></MainLayout>} />
        <Route path="/workshop/:id" element={<MainLayout><WorkshopDetail /></MainLayout>} />
        <Route path="/my-tickets" element={<MainLayout><MyTickets /></MainLayout>} />
        <Route path="/admin/create" element={<MainLayout><AdminCreateWorkshop /></MainLayout>} />
        <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
