import React, { useState, useEffect } from "react";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Dashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("mnkhan_user") || "{}");
    setUser(userData);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FDFDFD]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 md:ml-[260px] flex flex-col min-w-0">
        <Header
          onLogout={onLogout}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="p-4 md:p-12 mt-[70px] overflow-x-hidden">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
