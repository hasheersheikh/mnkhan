import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import Login from '../../../pages/Landing/Login';

interface PublicNavbarProps {
  onLoginSuccess: () => void;
  showLogin: boolean;
  setShowLogin: (show: boolean) => void;
  isAuthenticated: boolean;
}

const PublicNavbar: React.FC<PublicNavbarProps> = ({ 
  onLoginSuccess, 
  showLogin, 
  setShowLogin, 
  isAuthenticated 
}) => {
  const location = useLocation();
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('unauthorized')) {
      setAuthError(true);
      setShowLogin(true);
      const timer = setTimeout(() => setAuthError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinkClass = (path: string) => 
    `transition-colors hover:text-mnkhan-orange ${isActive(path) ? 'text-mnkhan-orange font-bold' : 'text-mnkhan-charcoal'}`;

  return (
    <>
      {authError && (
        <div className="bg-red-600 text-white text-[10px] uppercase font-bold tracking-[0.2em] py-2 text-center animate-in slide-in-from-top duration-300">
          Access Denied: Please login to access the Edge Portal
        </div>
      )}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 backdrop-blur-sm border-b border-mnkhan-gray-border/50 bg-white/80">
        <div className="text-left">
          <Link to="/" className="hover:opacity-80 transition-opacity block">
            <span className="text-2xl font-bold tracking-widest uppercase text-black">MN KHAN<span className="text-mnkhan-orange">.</span></span>
            <span className="block text-[10px] font-semibold uppercase text-mnkhan-text-muted tracking-[0.55em] -mt-1">& Associates</span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-10 font-semibold text-sm">
          <Link to="/services" className={navLinkClass('/services')}>Services</Link>
          <Link to="/people" className={navLinkClass('/people')}>People</Link>
          <Link to="/knowledge" className={navLinkClass('/knowledge')}>Knowledge Center</Link>
          
          {isAuthenticated ? (
            <Link 
              to="/portal" 
              className="bg-mnkhan-orange text-white px-6 py-2.5 rounded hover:bg-mnkhan-charcoal transition-all duration-300 shadow-lg shadow-mnkhan-orange/20 font-bold"
            >
              Go to Edge Portal
            </Link>
          ) : (
            <button 
              onClick={() => setShowLogin(true)}
              className="bg-mnkhan-charcoal text-white px-6 py-2.5 rounded hover:bg-mnkhan-orange transition-all duration-300 shadow-lg shadow-black/10"
            >
              Secure Client Access
            </button>
          )}
        </div>
      </nav>

      {/* Login Modal Overlay */}
      {showLogin && (
        <Login 
          onClose={() => setShowLogin(false)} 
          onSuccess={() => {
            setShowLogin(false);
            onLoginSuccess();
          }} 
        />
      )}
    </>
  );
};

export default PublicNavbar;
