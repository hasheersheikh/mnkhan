import React from 'react';
import { Outlet, NavLink } from 'react-router';

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center bg-mnkhan-charcoal text-white p-10 rounded-sm shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-mnkhan-orange rounded-full blur-[120px] opacity-10" />
        <div className="relative z-10">
          <h2 className="text-4xl font-serif italic mb-2">Administrative Hub</h2>
          <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Client Engagement & Compliance Control</p>
        </div>
        <div className="flex gap-4 relative z-10">
          <NavLink 
            to="/portal/manage-tasks"
            className={({ isActive }) => 
              `px-8 py-3 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${isActive ? 'bg-mnkhan-orange text-white' : 'bg-white/10 hover:bg-white/20 text-white/70'}`
            }
          >
            Manage Tasks
          </NavLink>
          <NavLink 
            to="/portal/manage-people"
            className={({ isActive }) => 
              `px-8 py-3 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${isActive ? 'bg-mnkhan-orange text-white' : 'bg-white/10 hover:bg-white/20 text-white/70'}`
            }
          >
            Manage People
          </NavLink>
          <NavLink 
            to="/portal/manage-appointments"
            className={({ isActive }) => 
              `px-8 py-3 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${isActive ? 'bg-mnkhan-orange text-white' : 'bg-white/10 hover:bg-white/20 text-white/70'}`
            }
          >
            Manage Appointments
          </NavLink>
        </div>
      </header>

      <Outlet />
    </div>
  );
};

export default AdminDashboard;
