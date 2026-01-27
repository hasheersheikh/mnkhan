import React from 'react';

interface TimelineEvent {
  event: string;
  date: string;
  note?: string;
}

interface TaskStep {
  title: string;
  completed: boolean;
  date?: string;
}

interface TaskTimelineProps {
  title: string;
  description: string;
  status: string;
  progress: number;
  timeline: TimelineEvent[];
  steps?: TaskStep[];
}

const TaskTimeline: React.FC<TaskTimelineProps> = ({ title, description, status, progress, timeline, steps }) => {
  const statusColors: Record<string, string> = {
    'pending': 'bg-gray-400',
    'in-progress': 'bg-mnkhan-orange',
    'completed': 'bg-green-500',
    'on-hold': 'bg-yellow-500'
  };

  return (
    <div className="bg-white p-8 rounded-sm shadow-sm border border-mnkhan-gray-border mb-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-serif italic text-mnkhan-charcoal mb-2">{title}</h3>
          <p className="text-sm text-mnkhan-text-muted max-w-2xl">{description}</p>
        </div>
        <div className="text-right">
          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white ${statusColors[status]}`}>
            {status}
          </span>
          <p className="text-xs text-mnkhan-text-muted mt-2 font-bold">{progress}% Complete</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-mnkhan-gray-border rounded-full mb-10 overflow-hidden">
        <div 
          className="h-full bg-mnkhan-orange transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps Tracking */}
      {steps && steps.length > 0 && (
        <div className="mb-10 animate-in fade-in slide-in-from-top-2 duration-500">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted mb-4 flex items-center gap-2">
            Incremental Progress Steps 
            <span className="h-[1px] flex-1 bg-mnkhan-gray-border" />
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {steps.map((step, idx) => (
              <div 
                key={idx} 
                className={`flex items-center gap-3 p-3 rounded border transition-colors ${
                  step.completed 
                    ? 'bg-green-50/30 border-green-100 text-green-800' 
                    : 'bg-mnkhan-gray-light/10 border-mnkhan-gray-border text-mnkhan-text-muted hover:border-mnkhan-orange/30'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border ${
                  step.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'bg-white border-mnkhan-gray-border text-mnkhan-text-muted'
                }`}>
                  {step.completed ? '✓' : idx + 1}
                </div>
                <span className="text-xs font-medium uppercase tracking-tighter">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline List */}
      <div className="relative pl-8 border-l-2 border-mnkhan-gray-border space-y-8">
        {timeline.map((item, index) => (
          <div key={index} className="relative">
            {/* Dot */}
            <div className={`absolute -left-[41px] top-1 w-4 h-4 rounded-full border-2 border-white ${index === 0 ? 'bg-mnkhan-orange scale-125 shadow-lg shadow-mnkhan-orange/20' : 'bg-mnkhan-gray-border'}`} />
            
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <h4 className={`text-sm font-bold uppercase tracking-widest ${index === 0 ? 'text-mnkhan-charcoal' : 'text-mnkhan-text-muted'}`}>
                {item.event}
              </h4>
              <span className="text-[10px] font-bold text-mnkhan-text-muted opacity-60">
                {new Date(item.date).toLocaleDateString()}
              </span>
            </div>
            {item.note && (
              <div className="mt-2 p-3 bg-mnkhan-gray-light/10 border-l-2 border-mnkhan-orange/30 text-xs text-mnkhan-text-muted italic relative group hover:bg-mnkhan-gray-light/20 transition-colors">
                <span className="absolute -left-1.5 top-2 w-3 h-3 bg-white border border-mnkhan-orange/30 rounded-full flex items-center justify-center text-[6px] text-mnkhan-orange font-bold">i</span>
                {item.note}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskTimeline;
