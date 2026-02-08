import React, { useState } from 'react';
import { Link, Outlet } from 'react-router';
import PublicNavbar from '../Navigation/PublicNavbar';

interface PublicLayoutProps {
  onLogin: () => void;
  onLogout: () => void;
  isAuthenticated: boolean;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ onLogin, onLogout, isAuthenticated }) => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <PublicNavbar 
          isAuthenticated={isAuthenticated}
          onLoginSuccess={onLogin} 
          onLogout={onLogout}
          showLogin={showLogin} 
          setShowLogin={setShowLogin} 
        />
      </div>
      
      <main className="flex-1 pt-[88px]">
        <Outlet context={{ setShowLogin, isAuthenticated }} />
      </main>

      <footer className="relative z-10 bg-mnkhan-charcoal text-white py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="mb-4">
              <span className="text-2xl font-bold tracking-widest uppercase">MN KHAN<span className="text-mnkhan-orange">.</span></span>
              <span className="block text-[10px] font-semibold uppercase text-gray-400 tracking-[0.55em] -mt-1">& Associates</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs">
              Legal excellence across India.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col gap-3 text-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-orange mb-1">Quick Links</span>
              <Link to="/services" className="text-gray-400 hover:text-white transition-colors">Services</Link>
              <Link to="/people" className="text-gray-400 hover:text-white transition-colors">Our Team</Link>
              <Link to="/appointment" className="text-gray-400 hover:text-white transition-colors">Book Appointment</Link>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-orange mb-1">Legal</span>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Use</Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-700 text-center">
          <p className="text-xs text-gray-500">
            © 2026 MN Khan & Associates. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
