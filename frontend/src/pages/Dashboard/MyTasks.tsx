import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import * as tasksApi from '../../api/tasks';
import { Briefcase, ChevronRight, Gavel, Loader2, Scale } from 'lucide-react';

const MyTasks: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksApi.getTasks();
      if (response.data.success) {
        setTasks(response.data.tasks);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 opacity-50">
        <Loader2 size={32} className="text-mnkhan-orange animate-spin mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-widest italic">Auditing Matters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between md:items-end border-b-2 border-mnkhan-gray-border pb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-mnkhan-orange animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-mnkhan-text-muted">Institutional Procedural Registry</p>
          </div>
          <h2 className="text-5xl font-serif italic text-mnkhan-charcoal leading-tight">My Matters & <span className="text-mnkhan-orange">Case Progress</span></h2>
        </div>
        <div className="flex items-center gap-4 px-6 py-3 bg-mnkhan-charcoal text-white rounded-sm border border-mnkhan-charcoal shadow-2xl scale-105 origin-right">
          <Scale size={18} className="text-mnkhan-orange" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{tasks.length} Active Matters</span>
            <span className="text-[8px] text-white/40 uppercase font-black">Official Record</span>
          </div>
        </div>
      </div>

      {tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {tasks.map((task, idx) => (
            <Link 
              key={task._id} 
              to={`/portal/my-tasks/${task._id}`}
              className="bg-white border border-mnkhan-gray-border rounded-sm shadow-sm hover:border-mnkhan-orange hover:shadow-2xl transition-all duration-700 group relative overflow-hidden flex flex-col h-full animate-in slide-in-from-bottom-8"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-8">
                  <div className="bg-mnkhan-gray-light/30 p-3.5 rounded-sm text-mnkhan-charcoal group-hover:bg-mnkhan-orange/10 group-hover:text-mnkhan-orange transition-all duration-500">
                    <Briefcase size={22} className="group-hover:scale-110 transition-transform" />
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm text-white shadow-sm ${
                    task.status === 'completed' ? 'bg-green-600' : 
                    task.status === 'in-progress' ? 'bg-mnkhan-orange' : 'bg-mnkhan-charcoal'
                  }`}>
                    {task.status}
                  </span>
                </div>

                <h4 className="text-xl font-serif italic text-mnkhan-charcoal mb-4 group-hover:text-mnkhan-orange transition-colors line-clamp-2 leading-snug">
                  {task.title}
                </h4>
                <p className="text-[11px] text-mnkhan-text-muted line-clamp-3 leading-relaxed mb-10 h-12 opacity-80">
                  {task.description}
                </p>

                {/* Progress Visualization */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Procedural Maturity</span>
                    <span className="text-sm font-serif italic text-mnkhan-orange">{task.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-mnkhan-gray-light rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-mnkhan-orange transition-all duration-1000 ease-out relative"
                      style={{ width: `${task.progress}%` }}
                    >
                       <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-5 bg-mnkhan-gray-light/10 border-t border-mnkhan-gray-border flex justify-between items-center group-hover:bg-mnkhan-orange/5 transition-colors">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-mnkhan-gray-border group-hover:bg-mnkhan-orange transition-colors" />
                   <span className="text-[10px] font-bold text-mnkhan-text-muted uppercase tracking-widest">View Detailed File</span>
                </div>
                <ChevronRight size={18} className="text-mnkhan-text-muted group-hover:text-mnkhan-orange group-hover:translate-x-1 transition-all" />
              </div>

              {/* Decorative Accent */}
              <div className="absolute top-0 right-0 w-1 h-32 bg-mnkhan-orange/0 group-hover:bg-mnkhan-orange/100 transition-all duration-700" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white p-32 text-center rounded-sm border-2 border-dashed border-mnkhan-gray-border relative overflow-hidden group">
          <div className="absolute inset-0 bg-mnkhan-gray-light/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="bg-mnkhan-gray-light/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border border-mnkhan-gray-border">
              <Gavel size={48} className="text-mnkhan-charcoal opacity-30 group-hover:text-mnkhan-orange group-hover:opacity-100 transition-all duration-500" />
            </div>
            <p className="text-xl font-serif italic text-mnkhan-charcoal mb-3">No active legal matters indexed.</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-mnkhan-text-muted">Your institutional procedural record is currently empty</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
