import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, X, ClipboardList, Briefcase, Users, Command, Loader2 } from 'lucide-react';
import * as tasksApi from '../../api/tasks';
import * as servicesApi from '../../api/services';
import * as adminApi from '../../api/admin';

const Header: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<any>({ name: 'User', email: '', role: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{tasks: any[], services: any[], people: any[]}>({tasks: [], services: [], people: []});
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = ['admin', 'super-admin'].includes(user?.role);

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
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowSearchResults(false);
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults({tasks: [], services: [], people: []});
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      // Parallel fetch for search results
      const [tasksRes, servicesRes, usersRes] = await Promise.all([
        tasksApi.getTasks(), // In real app, we'd use a server-side search endpoint
        servicesApi.getServices(),
        isAdmin ? adminApi.getUsers() : Promise.resolve({data: {success: true, users: []}})
      ]);

      const q = query.toLowerCase();

      const filteredTasks = (tasksRes.data.tasks || []).filter((t: any) => 
        t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
      ).slice(0, 3);

      const filteredServices = (servicesRes.data.services || []).filter((s: any) => 
        s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
      ).slice(0, 3);

      const filteredPeople = (usersRes.data.users || []).filter((u: any) => 
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      ).slice(0, 3);

      setSearchResults({
        tasks: filteredTasks,
        services: filteredServices,
        people: filteredPeople
      });
    } catch (err) {
      console.error('[Search] Error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const navTo = (path: string) => {
    setShowSearchResults(false);
    setSearchQuery('');
    navigate(path);
  };

  return (
    <header className="fixed top-0 left-[260px] right-0 z-[90] flex h-[70px] items-center justify-between bg-white px-8 border-b border-mnkhan-gray-border">
      <div className="flex-1 max-w-[500px] relative" ref={searchRef}>
        <div className="relative group">
          <Search 
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchQuery ? 'text-mnkhan-orange' : 'text-mnkhan-text-muted group-hover:text-mnkhan-charcoal'}`} 
            size={16} 
          />
          <input 
            ref={searchInputRef}
            type="text" 
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
            placeholder="Search tasks, services, or people..." 
            className="w-full bg-[#FAFAFA] border border-mnkhan-gray-border rounded px-11 py-2.5 focus:outline-none focus:border-mnkhan-orange focus:bg-white text-sm transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            {isSearching ? (
              <Loader2 size={12} className="animate-spin text-mnkhan-orange" />
            ) : !searchQuery ? (
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-mnkhan-gray-light/50 border border-mnkhan-gray-border rounded text-[9px] font-bold text-mnkhan-text-muted">
                <Command size={8} /> K
              </div>
            ) : (
              <button 
                onClick={() => handleSearch('')}
                className="pointer-events-auto p-1 hover:bg-mnkhan-gray-light rounded-full text-mnkhan-text-muted hover:text-mnkhan-charcoal"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-mnkhan-gray-border shadow-2xl rounded-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {searchResults.tasks.length === 0 && searchResults.services.length === 0 && searchResults.people.length === 0 && !isSearching ? (
                <div className="p-8 text-center">
                  <p className="text-xs text-mnkhan-text-muted italic uppercase tracking-widest">No results found for "{searchQuery}"</p>
                </div>
              ) : (
                <>
                  {searchResults.tasks.length > 0 && (
                    <div className="p-2 border-b border-mnkhan-gray-border last:border-0">
                      <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-mnkhan-orange bg-mnkhan-orange/5 rounded-sm mb-1">Active Matters</p>
                      {searchResults.tasks.map(task => (
                        <button 
                          key={task._id}
                          onClick={() => navTo(isAdmin ? '/portal/admin-tasks' : '/portal/my-tasks')}
                          className="w-full text-left px-3 py-2 hover:bg-mnkhan-gray-light/50 rounded transition-colors flex items-center gap-3"
                        >
                          <ClipboardList size={14} className="text-mnkhan-text-muted" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-mnkhan-charcoal truncate">{task.title}</p>
                            <p className="text-[10px] text-mnkhan-text-muted truncate">{task.progress}% Complete</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.services.length > 0 && (
                    <div className="p-2 border-b border-mnkhan-gray-border last:border-0">
                      <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-mnkhan-charcoal bg-mnkhan-gray-light/50 rounded-sm mb-1">Legal Services</p>
                      {searchResults.services.map(service => (
                        <button 
                          key={service._id}
                          onClick={() => navTo(isAdmin ? '/portal/admin-services' : '/services')}
                          className="w-full text-left px-3 py-2 hover:bg-mnkhan-gray-light/50 rounded transition-colors flex items-center gap-3"
                        >
                          <Briefcase size={14} className="text-mnkhan-text-muted" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-mnkhan-charcoal truncate">{service.name}</p>
                            <p className="text-[10px] text-mnkhan-text-muted truncate">{service.category || 'Professional'}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {isAdmin && searchResults.people.length > 0 && (
                    <div className="p-2 border-b border-mnkhan-gray-border last:border-0">
                      <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-mnkhan-text-muted bg-mnkhan-gray-bg rounded-sm mb-1">Clients & Users</p>
                      {searchResults.people.map(person => (
                        <button 
                          key={person._id}
                          onClick={() => navTo('/portal/admin-clients')}
                          className="w-full text-left px-3 py-2 hover:bg-mnkhan-gray-light/50 rounded transition-colors flex items-center gap-3"
                        >
                          <Users size={14} className="text-mnkhan-text-muted" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-mnkhan-charcoal truncate">{person.name}</p>
                            <p className="text-[10px] text-mnkhan-text-muted truncate">{person.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            {searchQuery.length >= 2 && !isSearching && (
              <div className="bg-mnkhan-gray-bg py-2 px-4 border-t border-mnkhan-gray-border">
                <p className="text-[10px] text-mnkhan-text-muted font-bold uppercase tracking-tighter">Press ESC to close • Showing top matches</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-8">
        {!isAdmin && (
          <Link 
            to="/services" 
            className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-mnkhan-orange hover:text-mnkhan-charcoal transition-colors hover:underline underline-offset-4"
          >
            Explore Services →
          </Link>
        )}
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
                onClick={() => { window.location.href = '/portal/account-security'; setShowDropdown(false); }}
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
