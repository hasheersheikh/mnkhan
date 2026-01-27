import React, { useState, useEffect } from 'react';
import * as tasksApi from '../../api/tasks';
import * as adminApi from '../../api/admin';
import * as servicesApi from '../../api/services';

const ManageTasks: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [taskForm, setTaskForm] = useState({ 
    title: '', 
    description: '', 
    userId: '', 
    progress: 0,
    steps: [] as { title: string; completed: boolean }[]
  });
  const [newStep, setNewStep] = useState('');

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [updateEvent, setUpdateEvent] = useState('');
  const [updateComment, setUpdateComment] = useState('');
  const [newUpdateStep, setNewUpdateStep] = useState('');
  const [manualProgress, setManualProgress] = useState<number>(0);
  const [availableServices, setAvailableServices] = useState<any[]>([]);

  useEffect(() => {
    fetchTasksData();
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await servicesApi.getServices();
      if (res.data.success) setAvailableServices(res.data.services);
    } catch (err) { console.error(err); }
  };

  const fetchTasksData = async () => {
    try {
      setLoading(true);
      const [usersRes, tasksRes] = await Promise.all([
        adminApi.getUsers(),
        tasksApi.getTasks()
      ]);
      
      if (usersRes.data.success) setClients(usersRes.data.users);
      if (tasksRes.data.success) setTasks(tasksRes.data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await tasksApi.createTask(taskForm);
      if (res.data.success) {
        setTaskForm({ title: '', description: '', userId: '', progress: 0, steps: [] });
        fetchTasksData();
        console.log('[Admin] Task created successfully');
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await tasksApi.deleteTask(taskId);
      if (res.data.success) {
        fetchTasksData();
        console.log('[Admin] Task deleted');
      }
    } catch (err) { console.error(err); }
  };

  const handleManualProgressUpdate = async (taskId: string) => {
    try {
      const res = await tasksApi.updateTask(taskId, { progress: manualProgress });
      if (res.data.success) {
        setEditingTaskId(null);
        fetchTasksData();
      }
    } catch (err) { console.error(err); }
  };

  const handleToggleStep = async (taskId: string, stepIndex: number) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const updatedSteps = (task.steps || []).map((s: any, i: number) => 
      i === stepIndex ? { ...s, completed: !s.completed } : s
    );
    
    try {
      const res = await tasksApi.updateTask(taskId, { steps: updatedSteps });
      if (res.data.success) {
        fetchTasksData();
      }
    } catch (err) { console.error(err); }
  };

  const handleAddTimelineEvent = async (taskId: string) => {
    if (!updateEvent.trim()) return;

    try {
      const res = await tasksApi.updateTask(taskId, {
        newEvent: updateEvent,
        eventNote: updateComment
      });
      if (res.data.success) {
        setUpdateEvent('');
        setUpdateComment('');
        setEditingTaskId(null);
        fetchTasksData();
      }
    } catch (err) { console.error(err); }
  };

  const handleAddStepToExisting = async (taskId: string) => {
    if (!newUpdateStep.trim()) return;
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const updatedSteps = [...(task.steps || []), { title: newUpdateStep, completed: false }];
    
    try {
      const res = await tasksApi.updateTask(taskId, { steps: updatedSteps });
      if (res.data.success) {
        setNewUpdateStep('');
        fetchTasksData();
      }
    } catch (err) { console.error(err); }
  };

  const handleAddStep = () => {
    if (newStep.trim()) {
      setTaskForm({
        ...taskForm,
        steps: [...taskForm.steps, { title: newStep, completed: false }]
      });
      setNewStep('');
    }
  };

  const handleRemoveStep = (index: number) => {
    setTaskForm({
      ...taskForm,
      steps: taskForm.steps.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-500">
      <div className="col-span-12 lg:col-span-4">
        <div className="bg-white p-8 rounded-sm shadow-sm border border-mnkhan-gray-border">
          <h3 className="text-xl font-serif italic mb-6 text-mnkhan-charcoal">Assign New Matter</h3>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Client Account</label>
              <select 
                required
                value={taskForm.userId}
                onChange={e => setTaskForm({...taskForm, userId: e.target.value})}
                className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none bg-transparent"
              >
                <option value="">Select a Client</option>
                {clients.map((c: any) => <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Template Service (Auto-populates steps)</label>
              <select 
                onChange={e => {
                  const service = availableServices.find(s => s._id === e.target.value);
                  if (service) {
                    setTaskForm({
                      ...taskForm,
                      title: service.name,
                      description: service.description,
                      steps: (service.defaultSteps || []).map((s: string) => ({ title: s, completed: false }))
                    });
                  }
                }}
                className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none bg-transparent"
              >
                <option value="">Manual Entry (No Template)</option>
                {availableServices.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Matter Title</label>
              <input 
                type="text" required
                value={taskForm.title}
                onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                placeholder="e.g. IEC License Filing"
                className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none"
              />
            </div>
            
            <div className="space-y-3 pt-4 border-t border-mnkhan-gray-border">
              <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted flex justify-between">
                Incremental Steps
                <span className="text-mnkhan-orange">Auto-calculates Progress</span>
              </label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newStep}
                  onChange={e => setNewStep(e.target.value)}
                  placeholder="Add a step..."
                  className="flex-1 border-b border-mnkhan-gray-border focus:border-mnkhan-orange py-1 outline-none text-xs"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStep())}
                />
                <button 
                  type="button"
                  onClick={handleAddStep}
                  className="bg-mnkhan-charcoal text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest hover:bg-mnkhan-orange"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                {taskForm.steps.map((step, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px] bg-mnkhan-gray-light/10 p-2 rounded">
                    <span className="truncate">{step.title}</span>
                    <button type="button" onClick={() => handleRemoveStep(idx)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                  </div>
                ))}
              </div>
            </div>

            {!taskForm.steps.length && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Manual Progress %</label>
                <input 
                  type="number" min="0" max="100"
                  value={taskForm.progress}
                  onChange={e => setTaskForm({...taskForm, progress: parseInt(e.target.value)})}
                  className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none"
                />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Description</label>
              <textarea 
                required
                value={taskForm.description}
                onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none h-24"
              />
            </div>
            <button type="submit" className="w-full bg-mnkhan-charcoal text-white py-3 font-bold uppercase tracking-widest text-xs hover:bg-mnkhan-orange transition-all">
              Assign Matter
            </button>
          </form>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-8">
        <div className="bg-white p-8 rounded-sm shadow-sm border border-mnkhan-gray-border min-h-[600px]">
          <h3 className="text-xl font-bold text-mnkhan-charcoal mb-8">Current Legal Matters</h3>
          <div className="space-y-4">
            {loading ? (
              <p className="text-mnkhan-text-muted italic text-sm text-center py-20">Updating records...</p>
            ) : tasks.length > 0 ? (
              tasks.map((t: any) => (
                <div key={t._id} className="p-6 border border-mnkhan-gray-border rounded-sm hover:border-mnkhan-orange transition-colors animate-in fade-in duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-mnkhan-charcoal">{t.title}</h4>
                      <p className="text-xs text-mnkhan-text-muted mt-1">Client: {t.userId?.name || 'Unknown'}</p>
                      <div className="mt-2 flex gap-1">
                        {t.steps?.map((s: any, i: number) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${s.completed ? 'bg-green-500' : 'bg-mnkhan-gray-border'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded text-white ${t.status === 'completed' ? 'bg-green-600' : 'bg-mnkhan-charcoal'}`}>
                        {t.status}
                      </span>
                      <p className="text-[10px] font-bold text-mnkhan-orange mt-1">{t.progress}%</p>
                      
                      <div className="flex flex-col items-end gap-2 mt-4">
                        <button 
                          onClick={() => {
                            if (editingTaskId === t._id) {
                              setEditingTaskId(null);
                            } else {
                              setEditingTaskId(t._id);
                              setManualProgress(t.progress || 0);
                            }
                          }}
                          className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal hover:text-mnkhan-orange border-b border-mnkhan-gray-border pb-0.5"
                        >
                          {editingTaskId === t._id ? 'Close' : 'Update Progress'}
                        </button>
                        <button 
                          onClick={() => handleDeleteTask(t._id)}
                          className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                        >
                          Delete Matter
                        </button>
                      </div>
                    </div>
                  </div>

                  {editingTaskId === t._id && (
                    <div className="mt-6 pt-6 border-t border-mnkhan-gray-border space-y-6 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted block">Matter Milestones & Progress</label>
                        <div className="flex gap-2 mb-4">
                          <input 
                            type="text"
                            value={newUpdateStep}
                            onChange={e => setNewUpdateStep(e.target.value)}
                            placeholder="Add new milestone..."
                            className="flex-1 border-b border-mnkhan-gray-border focus:border-mnkhan-orange py-1 outline-none text-[10px] uppercase tracking-tighter"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStepToExisting(t._id))}
                          />
                          <button 
                            onClick={() => handleAddStepToExisting(t._id)}
                            className="bg-mnkhan-charcoal text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest hover:bg-mnkhan-orange"
                          >
                            Add
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {t.steps?.map((s: any, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => handleToggleStep(t._id, idx)}
                              className={`flex items-center gap-3 p-2 rounded border text-left transition-all ${
                                s.completed ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-mnkhan-gray-border text-mnkhan-text-muted hover:border-mnkhan-orange/30'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${s.completed ? 'bg-green-500 text-white' : 'bg-mnkhan-gray-light border border-mnkhan-gray-border'}`}>
                                {s.completed && '✓'}
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-tighter">{s.title}</span>
                            </button>
                          ))}
                        </div>

                        <div className="pt-4 border-t border-dotted border-mnkhan-gray-border">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted block mb-2">Manual Progress Override (%)</label>
                          <div className="flex items-center gap-4">
                            <input 
                              type="range" min="0" max="100"
                              value={manualProgress}
                              onChange={e => setManualProgress(parseInt(e.target.value))}
                              className="flex-1 h-1 bg-mnkhan-gray-border rounded-lg appearance-none cursor-pointer accent-mnkhan-orange"
                            />
                            <span className="text-xs font-bold text-mnkhan-orange w-8">{manualProgress}%</span>
                            <button 
                              onClick={() => handleManualProgressUpdate(t._id)}
                              className="bg-mnkhan-orange text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest hover:bg-mnkhan-charcoal transition-all"
                            >
                              Set
                            </button>
                          </div>
                          <p className="text-[9px] text-mnkhan-text-muted mt-1 italic">Note: Updates to steps will recalculate this.</p>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-dotted border-mnkhan-gray-border">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted block">Add Status Update (Comment)</label>
                        <input 
                          type="text"
                          value={updateEvent}
                          onChange={e => setUpdateEvent(e.target.value)}
                          placeholder="Event Title (e.g. Documents Reviewed)"
                          className="w-full border-b border-mnkhan-gray-border focus:border-mnkhan-orange py-1 outline-none text-xs"
                        />
                        <textarea 
                          value={updateComment}
                          onChange={e => setUpdateComment(e.target.value)}
                          placeholder="Detailed note or comment for the client..."
                          className="w-full border border-mnkhan-gray-border focus:border-mnkhan-orange p-2 outline-none text-xs h-20"
                        />
                        <button 
                          onClick={() => handleAddTimelineEvent(t._id)}
                          className="bg-mnkhan-charcoal text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-mnkhan-orange transition-all"
                        >
                          Post Update
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : <p className="text-mnkhan-text-muted italic text-sm text-center py-20">No legal matters currently active.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageTasks;
