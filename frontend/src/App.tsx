import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import Dashboard from './pages/Dashboard/Dashboard';
import LandingPage from './pages/Landing/LandingPage';
import ServicesPage from './pages/Services/ServicesPage';
import ServiceDetailPage from './pages/Services/ServiceDetailPage';
import PeoplePage from './pages/People/PeoplePage';
import KnowledgePage from './pages/Knowledge/KnowledgePage';
import TermsOfService from './pages/Legal/TermsOfService';
import PrivacyPolicy from './pages/Legal/PrivacyPolicy';
import PublicLayout from './components/Common/Layout/PublicLayout';
import ManageTasks from './pages/Dashboard/ManageTasks';
import ManagePeople from './pages/Dashboard/ManagePeople';
import ManageServices from './pages/Dashboard/ManageServices';
import ManageInquiries from './pages/Dashboard/ManageInquiries';
import ManageBlogs from './pages/Dashboard/ManageBlogs';
import MyInquiries from './pages/Dashboard/MyInquiries';
import PortalOverview from './pages/Dashboard/PortalOverview';
import MyTasks from './pages/Dashboard/MyTasks';
import TaskDetails from './pages/Dashboard/TaskDetails';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import ResetPasswordForm from './components/Dashboard/ResetPasswordForm';
import BlogDetailPage from './pages/Knowledge/BlogDetailPage';
import NotFound from './pages/NotFound';
import AppointmentPage from './pages/Appointment/AppointmentPage';
import PaymentSuccess from './pages/Appointment/PaymentSuccess';
import ManageAppointments from './pages/Dashboard/ManageAppointments';
import MyDocuments from './pages/Dashboard/MyDocuments';
import ManageDocuments from './pages/Dashboard/ManageDocuments';
import ManageClients from './pages/Dashboard/ManageClients';
import ManageVouchers from './pages/Dashboard/ManageVouchers';
import CartPage from './pages/Services/CartPage';
import ScrollToTop from './components/Common/ScrollToTop';
import ResetPassword from './pages/Landing/ResetPassword';


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('mnkhan_token'));

  const logout = () => {
    localStorage.removeItem('mnkhan_token');
    localStorage.removeItem('mnkhan_user');
    setIsAuthenticated(false);
    // Force redirect to home page on manual logout
    window.location.href = '/';
  };

  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const user = JSON.parse(localStorage.getItem('mnkhan_user') || '{}');
    const isAdmin = ['admin', 'super-admin'].includes(user?.role);
    
    useEffect(() => {
      if (isAuthenticated && !isAdmin) {
        console.warn('Unauthorized access attempt to administrative route. Terminating session.');
        logout();
      }
    }, [isAdmin]);

    if (!isAuthenticated) return <Navigate to="/?unauthorized=true" replace />;
    if (!isAdmin) return null; // Logic handled in useEffect

    return <>{children}</>;
  };

  const PortalOverviewWrapper = () => {
    const user = JSON.parse(localStorage.getItem('mnkhan_user') || '{}');
    const isAdmin = ['admin', 'super-admin'].includes(user?.role);
    return <PortalOverview userName={user?.name || 'Client'} isAdmin={isAdmin} />;
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Routes with Layout */}
        <Route element={<PublicLayout isAuthenticated={isAuthenticated} onLogin={() => setIsAuthenticated(true)} onLogout={logout} />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:id" element={<ServiceDetailPage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/knowledge/:id" element={<BlogDetailPage />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/appointment" element={<AppointmentPage />} />
          <Route path="/appointment/success" element={<PaymentSuccess />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Portal Routes - Protected */}
        <Route 
          path="/portal" 
          element={
            isAuthenticated ? (
              <Dashboard onLogout={logout} />
            ) : (
              <Navigate to="/?unauthorized=true" replace />
            )
          }
        >
          <Route index element={<Navigate to="/portal/overview" replace />} />
          <Route path="overview" element={<PortalOverviewWrapper />} />
          <Route path="my-tasks" element={<MyTasks />} />
          <Route path="my-tasks/:id" element={<TaskDetails />} />
          <Route path="my-inquiries" element={<MyInquiries />} />
          <Route path="documents" element={<MyDocuments />} />
          
          {/* Admin Wrapper Route */}
          <Route 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          >
            <Route path="admin-tasks" element={<ManageTasks />} />
            <Route path="admin-tasks/:id" element={<TaskDetails />} />
            <Route path="admin-people" element={<ManagePeople />} />
            <Route path="admin-services" element={<ManageServices />} />
            <Route path="admin-inquiries" element={<ManageInquiries />} />
            <Route path="admin-appointments" element={<ManageAppointments />} />
            <Route path="admin-documents" element={<ManageDocuments />} />
            <Route path="admin-clients" element={<ManageClients />} />
            <Route path="admin-vouchers" element={<ManageVouchers />} />
            <Route path="admin-content" element={<ManageBlogs />} />
          </Route>

          <Route path="account-security" element={<ResetPasswordForm />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
