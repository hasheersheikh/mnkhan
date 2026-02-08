import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, LayoutDashboard, FileText } from 'lucide-react';
import * as tasksApi from '../../api/tasks';
import MatterOverview from '../../components/Dashboard/MatterOverview';
import MatterDocuments from '../../components/Dashboard/MatterDocuments';
import StaffAssignmentModal from '../../components/Dashboard/StaffAssignmentModal';
import { UserPlus } from 'lucide-react';

const TaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents'>('overview');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('mnkhan_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const userRole = user.role;
      setIsAdmin(['admin', 'super-admin'].includes(userRole));
      setIsStaff(userRole === 'staff');
    }
  }, []);

  useEffect(() => {
    if (id) fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const res = await tasksApi.getTaskById(id!);
      if (res.data.success) setTask(res.data.task);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (text: string) => {
    try {
      const res = await tasksApi.addComment(id!, text);
      if (res.data.success) {
        setTask(res.data.task);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] opacity-30">
        <div className="w-10 h-10 border-4 border-mnkhan-orange border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] italic">Retrieving Official Record...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="bg-red-50 p-12 text-center border border-red-100 rounded-sm">
        <p className="text-red-700 font-serif italic text-lg mb-2">Matter Record Not Found</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">The requested procedural file does not exist or access is restricted.</p>
        <button onClick={() => navigate(-1)} className="mt-8 text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal underline underline-offset-4">Return to Registry</button>
      </div>
    );
  }

  // Determine back navigation based on user role
  const getBackPath = () => {
    const userStr = localStorage.getItem('mnkhan_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === 'admin') return '/portal/admin-tasks';
    }
    return '/portal/my-tasks';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1600px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-2 border-b border-mnkhan-gray-border pb-8 gap-6">
        <div className="flex items-start gap-6">
          <button 
            onClick={() => navigate(getBackPath())}
            className="mt-1.5 p-3 bg-white border border-mnkhan-gray-border hover:border-mnkhan-orange hover:text-mnkhan-orange rounded-sm transition-all shadow-sm group"
            title="Return to Registry"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-mnkhan-orange">Authorized Personnel Access Only</span>
            </div>
            <h2 className="text-4xl font-serif italic text-mnkhan-charcoal leading-tight">{task.title}</h2>
            <div className="flex items-center gap-4 mt-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Status: <span className="text-mnkhan-charcoal font-black">{task.status}</span></p>
              <div className="w-1 h-1 rounded-full bg-mnkhan-gray-border" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Matter ID: <span className="text-mnkhan-charcoal opacity-60">#{task._id.slice(-8).toUpperCase()}</span></p>
              {task.amountPaid && !isStaff && (
                <>
                  <div className="w-1 h-1 rounded-full bg-mnkhan-gray-border" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Amount Paid: <span className="text-mnkhan-charcoal font-black">₹{task.amountPaid.toLocaleString()}</span></p>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-4">
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => setIsAssignmentModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-mnkhan-charcoal text-mnkhan-charcoal text-[10px] font-bold uppercase tracking-widest hover:bg-mnkhan-charcoal hover:text-white transition-all rounded-sm shadow-sm"
              >
                <UserPlus size={14} />
                Assign Staff
              </button>
            )}
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-bold uppercase tracking-widest text-mnkhan-text-muted mb-1">Finalized on</p>
              <p className="text-xs font-serif italic text-mnkhan-charcoal">{new Date(task.updatedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          
          {/* Tab Selection Navigation */}
          <div className="flex bg-mnkhan-gray-light/30 p-1 rounded-sm border border-mnkhan-gray-border">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${
                activeTab === 'overview' 
                  ? 'bg-mnkhan-charcoal text-white shadow-md' 
                  : 'text-mnkhan-text-muted hover:text-mnkhan-charcoal hover:bg-white/50'
              }`}
            >
              <LayoutDashboard size={14} />
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('documents')}
              className={`flex items-center gap-2 px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${
                activeTab === 'documents' 
                  ? 'bg-mnkhan-charcoal text-white shadow-md' 
                  : 'text-mnkhan-text-muted hover:text-mnkhan-charcoal hover:bg-white/50'
              }`}
            >
              <FileText size={14} />
              Documents
            </button>
          </div>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'overview' ? (
          <MatterOverview 
            taskId={task._id}
            description={task.description}
            timeline={task.timeline}
            steps={task.steps}
            comments={task.comments}
            onAddComment={handleAddComment}
          />
        ) : (
          <MatterDocuments 
            taskId={task._id}
            isAdmin={isAdmin}
            isStaff={isStaff}
          />
        )}
      </div>

      <StaffAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        onAssign={async (staffId) => {
          const res = await tasksApi.updateTask(task._id, { assignedStaffId: staffId });
          if (res.data.success) {
            setTask(res.data.task);
            alert('Staff assigned successfully.');
          }
        }}
        currentStaffId={task.assignedStaffId}
      />
    </div>
  );
};

export default TaskDetails;
