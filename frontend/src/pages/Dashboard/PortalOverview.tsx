import React, { useEffect, useState } from 'react';
import MatterWidget from './MatterWidget';
import FinancialWidget from './FinancialWidget';
import InsightsWidget from './InsightsWidget';
import * as tasksApi from '../../api/tasks';
import * as inquiriesApi from '../../api/inquiries';
import * as blogsApi from '../../api/blogs';
import * as servicesApi from '../../api/services';

interface OverviewProps {
  userName: string;
  isAdmin: boolean;
}

const PortalOverview: React.FC<OverviewProps> = ({ userName, isAdmin }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [servicesCount, setServicesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, blogsRes, servicesRes] = await Promise.all([
        tasksApi.getTasks(),
        blogsApi.getBlogs(),
        servicesApi.getServices()
      ]);

      if (tasksRes.data.success) setTasks(tasksRes.data.tasks.slice(0, 5));
      if (blogsRes.data.success) setBlogs(blogsRes.data.blogs.slice(0, 3));
      if (servicesRes.data.success) setServicesCount(servicesRes.data.services.length);

      if (isAdmin) {
        const inqRes = await inquiriesApi.getInquiries();
        if (inqRes.data.success) setInquiries(inqRes.data.inquiries.slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Active Matters', value: tasks.length, color: 'text-mnkhan-orange' },
    { label: 'Available Services', value: servicesCount, color: 'text-mnkhan-charcoal' },
    { label: 'Recent Inquiries', value: isAdmin ? inquiries.length : '...', color: 'text-mnkhan-orange' },
  ];

  return (
    <>
      <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-serif font-normal text-mnkhan-charcoal">
          Welcome back, <span className="text-mnkhan-orange">{userName}</span>.
        </h1>
        <p className="text-mnkhan-text-muted mt-2">
          {isAdmin ? 'Systems are online. Administrative overview of firm matters.' : 'Here is an overview of your active matters and financial status.'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded border border-mnkhan-gray-border flex flex-col items-center justify-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mnkhan-text-muted mb-2">{stat.label}</p>
            <p className={`text-3xl font-serif italic ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
        <MatterWidget tasks={tasks} loading={loading} />
        <FinancialWidget inquiries={inquiries} isAdmin={isAdmin} />
        <InsightsWidget blogs={blogs} loading={loading} />
      </div>
    </>
  );
};

export default PortalOverview;
