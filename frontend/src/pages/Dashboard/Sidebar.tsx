import React from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  FileText,
  ShieldCheck,
  Users,
  Briefcase,
  Mail,
  Calendar,
  Globe,
  PlusCircle,
  ArrowLeft,
  Tag,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const user = JSON.parse(localStorage.getItem("mnkhan_user") || "{}");
  const isAdmin = ["admin", "super-admin"].includes(user.role);
  const isStaff = user.role === "staff";
  const location = useLocation();

  const clientItems = [
    { label: "Overview", path: "/portal/overview", icon: LayoutDashboard },
    { label: "My Tasks", path: "/portal/my-tasks", icon: ClipboardList },
    {
      label: "My Inquiries",
      path: "/portal/my-inquiries",
      icon: MessageSquare,
    },
    { label: "Documents", path: "/portal/documents", icon: FileText },
    {
      label: "Account Security",
      path: "/portal/account-security",
      icon: ShieldCheck,
    },
  ];

  const adminItems = [
    { label: "Overview", path: "/portal/overview", icon: LayoutDashboard },
    { label: "Manage Tasks", path: "/portal/admin-tasks", icon: ClipboardList },
    { label: "Manage Staff", path: "/portal/admin-staff", icon: Users },
    { label: "Manage People", path: "/portal/admin-people", icon: Users },
    { label: "Manage Clients", path: "/portal/admin-clients", icon: Users },
    {
      label: "Manage Services",
      path: "/portal/admin-services",
      icon: Briefcase,
    },
    { label: "Manage Inquiries", path: "/portal/admin-inquiries", icon: Mail },
    { label: "Manage Vouchers", path: "/portal/admin-vouchers", icon: Tag },
    {
      label: "Manage Appointments",
      path: "/portal/admin-appointments",
      icon: Calendar,
    },
    {
      label: "Manage Documents",
      path: "/portal/admin-documents",
      icon: FileText,
    },
    { label: "Site Content", path: "/portal/admin-content", icon: Globe },
    {
      label: "Account Security",
      path: "/portal/account-security",
      icon: ShieldCheck,
    },
  ];

  const staffItems = [
    { label: "Overview", path: "/portal/overview", icon: LayoutDashboard },
    {
      label: "Assigned Matters",
      path: "/portal/my-tasks",
      icon: ClipboardList,
    },
    { label: "Documents", path: "/portal/documents", icon: FileText },
    {
      label: "Account Security",
      path: "/portal/account-security",
      icon: ShieldCheck,
    },
  ];

  const navItems = isAdmin ? adminItems : isStaff ? staffItems : clientItems;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-[99] md:hidden transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
      />
      <aside
        className={`fixed left-0 top-0 z-[100] flex h-screen w-[260px] flex-col bg-mnkhan-charcoal text-white transition-transform duration-300 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 md:p-8 border-b border-white/5 bg-black/20 group flex justify-between items-center">
          <Link to="/" className="block" onClick={() => setIsOpen(false)}>
            <span className="text-xl md:text-2xl font-bold tracking-widest uppercase text-white block">
              MN KHAN<span className="text-mnkhan-orange">.</span>
            </span>
            <span className="block text-[8px] md:text-[10px] font-semibold uppercase text-mnkhan-text-muted tracking-[0.55em] -mt-1 transition-colors group-hover:text-mnkhan-orange">
              & Associates
            </span>
          </Link>
          <button
            className="md:hidden p-2 text-white/70 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          {!isAdmin && !isStaff && (
            <div className="px-6 mb-8">
              <Link
                to="/services"
                className="flex items-center justify-center gap-3 w-full py-4 bg-mnkhan-orange text-white rounded font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-mnkhan-charcoal transition-all duration-300 shadow-xl shadow-mnkhan-orange/10"
              >
                <PlusCircle size={16} />
                Buy New Services
              </Link>
            </div>
          )}

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-6 md:px-8 py-3.5 md:py-4 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "text-white bg-white/5 border-l-4 border-mnkhan-orange"
                      : "text-[#B0B0B0] hover:text-white hover:bg-white/5 border-l-4 border-transparent hover:border-mnkhan-orange"
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? "text-mnkhan-orange" : "opacity-50"}
                  />
                  <span className="text-sm font-medium tracking-tight">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-8 py-6 border-t border-white/10">
          <Link
            to="/"
            className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B0B0B0] hover:text-mnkhan-orange transition-colors"
          >
            <ArrowLeft size={14} />
            Landing Page
          </Link>
        </div>

        <div className="px-6 md:px-8 py-4 md:py-6 text-[0.7rem] text-mnkhan-text-muted border-t border-white/5 bg-black/10">
          &copy; 2026 MN KHAN & Associates
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
