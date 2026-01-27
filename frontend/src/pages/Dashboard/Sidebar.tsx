import { Link, useLocation } from 'react-router';

const Sidebar: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('mnkhan_user') || '{}');
  const isAdmin = ['admin', 'super-admin'].includes(user.role);
  const location = useLocation();

  const clientItems = [
    { label: 'Overview', path: '/portal/overview' },
    { label: 'My Tasks', path: '/portal/my-tasks' },
    { label: 'My Inquiries', path: '/portal/my-inquiries' },
    { label: 'Documents', path: '/portal/documents' },
    { label: 'Account Security', path: '/portal/account-security' },
  ];

  const adminItems = [
    { label: 'Overview', path: '/portal/overview' },
    { label: 'Manage Tasks', path: '/portal/manage-tasks' },
    { label: 'Manage People', path: '/portal/manage-people' },
    { label: 'Manage Services', path: '/portal/manage-services' },
    { label: 'Manage Inquiries', path: '/portal/manage-inquiries' },
    { label: 'Manage Appointments', path: '/portal/manage-appointments' },
    { label: 'Manage Documents', path: '/portal/manage-documents' },
    { label: 'Site Content', path: '/portal/site-content' },
    { label: 'Account Security', path: '/portal/account-security' },
  ];

  const navItems = isAdmin ? adminItems : clientItems;

  return (
    <aside className="fixed left-0 top-0 z-[100] flex h-screen w-[260px] flex-col bg-mnkhan-charcoal text-white">
      <div className="p-8 border-b border-white/5 bg-black/20 group">
        <Link to="/" className="block">
          <span className="text-2xl font-bold tracking-widest uppercase text-white block">
            MN KHAN<span className="text-mnkhan-orange">.</span>
          </span>
          <span className="block text-[10px] font-semibold uppercase text-mnkhan-text-muted tracking-[0.55em] -mt-1 transition-colors group-hover:text-mnkhan-orange">
            & Associates
          </span>
        </Link>
      </div>
      
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center px-8 py-4 transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'text-white bg-white/5 border-l-4 border-mnkhan-orange' 
                  : 'text-[#B0B0B0] hover:text-white hover:bg-white/5 border-l-4 border-transparent hover:border-mnkhan-orange'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-8 py-6 border-t border-white/10">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#B0B0B0] hover:text-mnkhan-orange transition-colors"
        >
          ← Back to Landing Page
        </Link>
      </div>

      <div className="p-8 text-[0.8rem] text-mnkhan-text-muted">
        &copy; 2026 MN KHAN 
      </div>
    </aside>
  );
};

export default Sidebar;
