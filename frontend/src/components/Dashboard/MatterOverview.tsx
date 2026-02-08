import React, { useState } from 'react';
import { 
  MessageSquare, Send, Shield, Info, CheckCircle2, 
  Clock, ChevronRight, Loader2 
} from 'lucide-react';

interface TimelineEvent {
  event: string;
  date: string;
  note?: string;
}

interface TaskStep {
  title: string;
  completed: boolean;
}

interface Comment {
  _id?: string;
  senderId: string;
  senderRole: string;
  text: string;
  date: string;
}

interface MatterOverviewProps {
  taskId: string;
  description: string;
  timeline: TimelineEvent[];
  steps?: TaskStep[];
  comments?: Comment[];
  onAddComment?: (text: string) => void;
}

const MatterOverview: React.FC<MatterOverviewProps> = ({ 
  taskId, 
  description, 
  timeline, 
  steps, 
  comments = [],
  onAddComment 
}) => {
  const [commentText, setCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !onAddComment) return;
    setIsSending(true);
    try {
      await onAddComment(commentText);
      setCommentText('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white rounded-sm shadow-sm border border-mnkhan-gray-border overflow-hidden flex flex-col xl:flex-row h-full xl:min-h-[700px] animate-in fade-in duration-700">
      
      {/* Left Column: Matter Overview & Timeline */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-[#fdfdfd] transition-all duration-500">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-1 0">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-mnkhan-orange animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-mnkhan-text-muted italic">Institutional Case File Prospectus</span>
              </div>
              
              {/* Refined Description Block */}
              <div className="relative mb-10">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-mnkhan-orange rounded-full opacity-30" />
                <div className="pl-6 py-1">
                  <p className="text-sm text-mnkhan-text-muted leading-relaxed font-medium opacity-90">
                    {description}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3 ml-8">
              {!isChatVisible && (
                <button 
                  onClick={() => setIsChatVisible(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-mnkhan-charcoal text-white text-[9px] font-bold uppercase tracking-widest rounded-sm hover:bg-mnkhan-orange transition-all shadow-md mt-2"
                >
                  <MessageSquare size={12} />
                  Open Discussion
                </button>
              )}
            </div>
          </div>

          {/* Milestones Grid */}
          {steps && steps.length > 0 && (
            <div className="mb-14">
              <div className="flex items-center gap-4 mb-8">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-mnkhan-charcoal whitespace-nowrap">Procedural Milestones</h4>
                <div className="h-px w-full bg-mnkhan-gray-border opacity-50" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {steps.map((step, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-5 rounded-sm border transition-all duration-300 ${
                      step.completed 
                        ? 'bg-green-50/10 border-green-200 shadow-sm' 
                        : 'bg-white border-mnkhan-gray-border hover:border-mnkhan-orange/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors ${
                        step.completed 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'bg-white border-mnkhan-gray-border text-mnkhan-text-muted'
                      }`}>
                        {step.completed ? '✓' : idx + 1}
                      </div>
                      <span className={`text-[11px] font-bold uppercase tracking-widest ${step.completed ? 'text-mnkhan-charcoal' : 'text-mnkhan-text-muted'}`}>
                        {step.title}
                      </span>
                    </div>
                    {step.completed && <CheckCircle2 size={16} className="text-green-500" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Execution Logs - Premium Redesign */}
          <div className="pt-10 border-t border-dotted border-mnkhan-gray-border">
            <div className="flex items-center gap-4 mb-12">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-mnkhan-charcoal whitespace-nowrap">Execution Timeline Logs</h4>
              <div className="h-px w-full bg-mnkhan-gray-border opacity-50" />
            </div>
            
            <div className="relative ml-4 pl-10 border-l-2 border-mnkhan-gray-border/60 space-y-12">
              {timeline.slice().reverse().map((item, index) => (
                <div key={index} className="relative group">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[51px] top-1 w-5 h-5 rounded-full border-4 border-white transition-all duration-500 group-hover:scale-125 ${
                    index === 0 ? 'bg-mnkhan-orange ring-8 ring-mnkhan-orange/10' : 'bg-mnkhan-gray-border opacity-60'
                  }`} />
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center bg-mnkhan-gray-light/30 p-2 rounded-sm border border-transparent group-hover:border-mnkhan-gray-border transition-all">
                      <h5 className={`text-[11px] font-bold uppercase tracking-[0.2em] ${index === 0 ? 'text-mnkhan-charcoal' : 'text-mnkhan-charcoal/60'}`}>
                        {item.event}
                      </h5>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-mnkhan-text-muted/60 opacity-80">
                        <Clock size={12} />
                        {new Date(item.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    
                    {item.note && (
                      <div className="p-5 bg-white border border-mnkhan-gray-border border-l-4 border-l-mnkhan-orange shadow-sm animate-in slide-in-from-left-2">
                        <div className="flex gap-4 items-start">
                          <Info size={16} className="text-mnkhan-orange shrink-0 mt-0.5" />
                          <p className="text-xs text-mnkhan-text-muted leading-relaxed font-medium">
                            {item.note}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Discussion Sidebar */}
      <div 
        className={`flex flex-col bg-white border-l border-mnkhan-gray-border transition-all duration-700 ease-in-out overflow-hidden shadow-2xl relative ${
          isChatVisible 
            ? 'w-full xl:w-[480px] opacity-100' 
            : 'w-0 xl:w-0 opacity-0 border-none pointer-events-none'
        }`}
      >
        <div className="p-6 border-b border-mnkhan-gray-border bg-mnkhan-charcoal text-white flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare size={18} className="text-mnkhan-orange" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Procedural Discussion</span>
            </div>
            <button 
              onClick={() => setIsChatVisible(false)}
              className="p-1.5 hover:bg-white/10 rounded-sm transition-colors text-white/50 hover:text-white"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Secure Official Channel</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-mnkhan-gray-light/5 custom-scrollbar flex flex-col">
          {comments.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-10 text-center py-20">
              <MessageSquare size={80} className="text-mnkhan-charcoal mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest text-mnkhan-charcoal italic">No internal logs found</p>
            </div>
          ) : (
            comments.map((comment, i) => (
              <div 
                key={i} 
                className={`flex flex-col animate-in fade-in slide-in-from-bottom-2 ${comment.senderRole === 'admin' ? 'items-start' : 'items-end'}`}
              >
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className={`text-[9px] font-bold uppercase tracking-tighter ${comment.senderRole === 'admin' ? 'text-mnkhan-orange' : 'text-mnkhan-charcoal'}`}>
                    {comment.senderRole === 'admin' ? 'Counsel Record' : 'Client Statement'}
                  </span>
                  <span className="text-[8px] text-mnkhan-text-muted opacity-50 font-bold">
                    {new Date(comment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div 
                  className={`max-w-[85%] p-4 rounded-sm text-xs leading-relaxed shadow-sm transition-transform hover:scale-[1.01] ${
                    comment.senderRole === 'admin' 
                      ? 'bg-mnkhan-charcoal text-white rounded-tl-none border-l-4 border-mnkhan-orange' 
                      : 'bg-white text-mnkhan-charcoal border border-mnkhan-gray-border rounded-tr-none'
                  }`}
                >
                  {comment.text}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-8 border-t border-mnkhan-gray-border bg-white shadow-[0_-8px_20px_rgba(0,0,0,0.03)]">
          <form onSubmit={handleSendComment} className="relative">
            <textarea 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Record formal query or response..."
              className="w-full bg-mnkhan-gray-light/10 border border-mnkhan-gray-border focus:border-mnkhan-orange p-5 pr-14 outline-none text-xs rounded-sm resize-none h-32 transition-all font-medium leading-relaxed"
            />
            <button 
              type="submit"
              disabled={isSending || !commentText.trim()}
              className={`absolute right-4 bottom-4 p-3 rounded-sm transition-all ${
                commentText.trim() ? 'bg-mnkhan-orange text-white hover:bg-mnkhan-charcoal shadow-lg scale-110' : 'text-mnkhan-gray-border bg-mnkhan-gray-light cursor-not-allowed'
              }`}
            >
              {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
          <div className="mt-4 flex items-center justify-between opacity-60">
            <div className="flex items-center gap-2 text-mnkhan-orange">
              <Shield size={12} />
              <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Privileged Interaction</span>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-mnkhan-text-muted">SECURE ID: {taskId.slice(-8).toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatterOverview;
