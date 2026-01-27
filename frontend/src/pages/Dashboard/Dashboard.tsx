import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import Header from './Header';

const Dashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('mnkhan_user') || '{}');
    setUser(userData);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FDFDFD]">
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col">
        <Header onLogout={onLogout} />
        <main className="p-12 mt-[70px]">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
