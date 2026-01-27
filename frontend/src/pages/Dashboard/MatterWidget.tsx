import React from 'react';

interface MatterWidgetProps {
  tasks: any[];
  loading: boolean;
}

const MatterWidget: React.FC<MatterWidgetProps> = ({ tasks, loading }) => {
  return (
    <div className="col-span-8 bg-white p-6 rounded border border-mnkhan-gray-border hover:translate-y-[-2px] hover:shadow-lg transition-all duration-200 min-h-[300px]">
      <h3 className="text-xl font-serif text-mnkhan-charcoal mb-6 border-b-2 border-mnkhan-orange inline-block pb-1">
        Active Matters
      </h3>
      <div className="space-y-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-50 rounded" />)}
          </div>
        ) : tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task._id}>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">{task.title}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-orange">
                  {task.status?.replace('-', ' ')}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-mnkhan-orange transition-all duration-1000" 
                  style={{ width: `${task.progress}%` }} 
                />
              </div>
            </div>
          ))
        ) : (
          <p className="italic text-mnkhan-text-muted py-8 text-center text-sm">No active matters found.</p>
        )}
      </div>
    </div>
  );
};

export default MatterWidget;
