import React from 'react';
import { Outlet, NavLink } from 'react-router';
import { ClipboardList, Users, Calendar, Activity, Briefcase, Tag, Mail } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="bg-white border border-mnkhan-gray-border rounded-sm shadow-sm overflow-hidden">
        {/* Top Branding Strip */}
        <div className="bg-mnkhan-charcoal h-1 w-full" />
        
        <div className="p-10 flex flex-col justify-between gap-8 relative">
          <div className="absolute top-0 right-0 w-96 h-full bg-mnkhan-orange/5 -skew-x-12 translate-x-32" />
          
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-mnkhan-orange/10 p-2 rounded-sm text-mnkhan-orange">
                  <Activity size={20} />
                </div>
                <h2 className="text-3xl font-serif italic text-mnkhan-charcoal leading-tight">Administrative Hub</h2>
              </div>
              <p className="text-mnkhan-text-muted text-[10px] font-bold uppercase tracking-[0.3em] pl-1">
                Client Engagement <span className="text-mnkhan-orange mx-2">•</span> Compliance Control
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 relative z-10">
            {[
              { to: '/portal/admin-tasks', label: 'Matters', icon: ClipboardList },
              { to: '/portal/admin-clients', label: 'Clients', icon: Users },
              { to: '/portal/admin-appointments', label: 'Appts', icon: Calendar },
              { to: '/portal/admin-services', label: 'Services', icon: Briefcase },
              { to: '/portal/admin-inquiries', label: 'Enquiries', icon: Mail },
              { to: '/portal/admin-vouchers', label: 'Vouchers', icon: Tag },
              { to: '/portal/admin-staff', label: 'Staff members', icon: Users },
              { to: '/portal/admin-people', label: 'Team', icon: Users },
            ].map((link) => (
              <NavLink 
                key={link.to}
                to={link.to}
                className={({ isActive }) => 
                  `flex items-center gap-2 px-4 py-2.5 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-all duration-300 border-b-2 ${
                    isActive 
                      ? 'bg-mnkhan-charcoal text-white border-mnkhan-orange shadow-lg shadow-mnkhan-charcoal/10' 
                      : 'bg-white text-mnkhan-charcoal border-transparent hover:bg-mnkhan-gray-light/30 hover:border-mnkhan-charcoal/20'
                  }`
                }
              >
                <link.icon size={12} />
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  );
};

export default AdminDashboard;
