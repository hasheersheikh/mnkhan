import React, { useState } from 'react';
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
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import ResetPasswordForm from './components/Dashboard/ResetPasswordForm';
import BlogDetailPage from './pages/Knowledge/BlogDetailPage';
import NotFound from './pages/NotFound';
import AppointmentPage from './pages/Appointment/AppointmentPage';
import PaymentSuccess from './pages/Appointment/PaymentSuccess';
import ManageAppointments from './pages/Dashboard/ManageAppointments';
import MyDocuments from './pages/Dashboard/MyDocuments';
import ManageDocuments from './pages/Dashboard/ManageDocuments';


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('mnkhan_token'));

  const logout = () => {
    localStorage.removeItem('mnkhan_token');
    localStorage.removeItem('mnkhan_user');
    setIsAuthenticated(false);
    // Force redirect to home page on manual logout
    window.location.href = '/';
  };

  const PortalOverviewWrapper = () => {
    const user = JSON.parse(localStorage.getItem('mnkhan_user') || '{}');
    const isAdmin = ['admin', 'super-admin'].includes(user?.role);
    return <PortalOverview userName={user?.name || 'Client'} isAdmin={isAdmin} />;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Layout */}
        <Route element={<PublicLayout isAuthenticated={isAuthenticated} onLogin={() => setIsAuthenticated(true)} />}>
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
          <Route path="my-inquiries" element={<MyInquiries />} />
          <Route path="documents" element={<MyDocuments />} />
          
          {/* Admin Wrapper Route */}
          <Route element={<AdminDashboard />}>
            <Route path="manage-tasks" element={<ManageTasks />} />
            <Route path="manage-people" element={<ManagePeople />} />
            <Route path="manage-services" element={<ManageServices />} />
            <Route path="manage-inquiries" element={<ManageInquiries />} />
            <Route path="manage-appointments" element={<ManageAppointments />} />
            <Route path="manage-documents" element={<ManageDocuments />} />
            <Route path="site-content" element={<ManageBlogs />} />
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
