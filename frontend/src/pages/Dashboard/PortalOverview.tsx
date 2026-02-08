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
  isStaff: boolean;
}

const PortalOverview: React.FC<OverviewProps> = ({ userName, isAdmin, isStaff }) => {
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

      if (tasksRes.data.success) {
        // For staff, API might already filter, but let's be sure or allow mixed fetches if needed
        setTasks(tasksRes.data.tasks.slice(0, 5));
      }
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

  const getStatCards = () => {
    if (isAdmin) {
      return [
        { label: 'Firm Matters', value: tasks.length, color: 'text-mnkhan-orange' },
        { label: 'Active Inquiries', value: inquiries.length, color: 'text-mnkhan-charcoal' },
        { label: 'Total Services', value: servicesCount, color: 'text-mnkhan-orange' },
      ];
    }
    if (isStaff) {
      return [
        { label: 'Assigned Matters', value: tasks.length, color: 'text-mnkhan-orange' },
        { label: 'Firm Knowledge', value: blogs.length, color: 'text-mnkhan-charcoal' },
        { label: 'Available Tools', value: servicesCount, color: 'text-mnkhan-orange' },
      ];
    }
    return [
      { label: 'My Matters', value: tasks.length, color: 'text-mnkhan-orange' },
      { label: 'Marketplace', value: servicesCount, color: 'text-mnkhan-charcoal' },
      { label: 'Updates', value: blogs.length, color: 'text-mnkhan-orange' },
    ];
  };

  const statCards = getStatCards();

  const getSubtext = () => {
    if (isAdmin) return 'Systems are online. Administrative overview of firm matters.';
    if (isStaff) return 'Focusing on your assigned portfolios and professional development.';
    return 'Your legal engagements and service portfolio overview.';
  };

  return (
    <>
      <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-serif font-normal text-mnkhan-charcoal uppercase tracking-tight">
          {isStaff ? 'Operations' : isAdmin ? 'Registry' : 'Client'} Overview. <span className="text-mnkhan-orange italic">{userName}</span>
        </h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-mnkhan-text-muted mt-3 flex items-center gap-3">
          <span className="w-8 h-[1px] bg-mnkhan-orange" />
          {getSubtext()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-10 rounded-sm border border-mnkhan-gray-border flex flex-col group hover:border-mnkhan-orange transition-all duration-500 shadow-sm hover:shadow-xl">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-mnkhan-text-muted mb-4 group-hover:text-mnkhan-orange transition-colors">{stat.label}</p>
            <p className={`text-4xl font-serif italic ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
        {/* Matter Widget - Collaborative focused for staff, Oversight for admin */}
        <MatterWidget tasks={tasks} loading={loading} />
        
        {/* Conditional middle widget */}
        {isAdmin ? (
          <FinancialWidget inquiries={inquiries} isAdmin={isAdmin} />
        ) : isStaff ? (
          <div className="col-span-4 bg-white p-8 border border-mnkhan-gray-border rounded-sm">
             <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-mnkhan-charcoal mb-6 border-b border-mnkhan-gray-border pb-4">Professional Protocol</h3>
             <ul className="space-y-4">
                {[
                  'Maintain confidentiality of all assigned records.',
                  'Update matter status within 24 hours of progression.',
                  'Utilize the firm registry for official documentation only.'
                ].map((rule, idx) => (
                  <li key={idx} className="text-xs text-mnkhan-text-muted flex gap-3 italic">
                    <span className="text-mnkhan-orange font-bold font-mono">{idx + 1}.</span>
                    {rule}
                  </li>
                ))}
             </ul>
          </div>
        ) : (
          <FinancialWidget inquiries={[]} isAdmin={false} />
        )}

        <InsightsWidget blogs={blogs} loading={loading} />
      </div>
    </>
  );
};

export default PortalOverview;
