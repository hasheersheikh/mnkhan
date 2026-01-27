import React, { useState, useRef, useEffect } from 'react';

const Header: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<any>({ name: 'Hashir Sheikh', email: 'hashir@mnkhan.com' });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('mnkhan_user') || '{}');
    if (userData.name) {
      setUser(userData);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-[260px] right-0 z-[90] flex h-[70px] items-center justify-between bg-white px-8 border-b border-mnkhan-gray-border">
      <div className="flex-1 max-w-[500px]">
        <input 
          type="text" 
          placeholder="What are you looking for?" 
          className="w-full bg-[#FAFAFA] border border-mnkhan-gray-border rounded px-4 py-2 focus:outline-none focus:border-mnkhan-orange text-sm"
        />
      </div>
      <div className="flex items-center gap-6">
        <button className="bg-mnkhan-orange text-white px-5 py-2 rounded font-semibold text-sm hover:bg-mnkhan-orange-hover transition-colors">
          Portals
        </button>
        
        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="h-[35px] w-[35px] rounded-full bg-mnkhan-orange flex items-center justify-center text-white font-bold text-sm">
              {getInitials(user.name)}
            </div>
            <span className="font-semibold text-sm select-none">{user.name}</span>
            <span className={`text-[10px] transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}>▼</span>
          </div>

          {showDropdown && (
            <div className="absolute right-0 mt-3 w-48 bg-white border border-mnkhan-gray-border shadow-xl rounded py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-mnkhan-gray-border mb-1">
                <p className="text-xs text-mnkhan-text-muted">Logged in as</p>
                <p className="text-sm font-bold truncate">{user.email}</p>
              </div>
              <button 
                onClick={() => { window.location.hash = '#account-security'; setShowDropdown(false); }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-mnkhan-gray-bg transition-colors"
              >
                Reset Password
              </button>
              <button 
                onClick={onLogout}
                className="w-full text-left px-4 py-2 text-sm text-mnkhan-orange hover:bg-mnkhan-orange/5 font-semibold transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
