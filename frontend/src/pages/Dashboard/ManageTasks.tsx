import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import * as tasksApi from '../../api/tasks';
import * as adminApi from '../../api/admin';
import * as servicesApi from '../../api/services';
import { 
  Search, Plus, Briefcase, ChevronRight, 
  Filter, ClipboardList, Clock, 
  Trash2, ExternalLink, Users
} from 'lucide-react';

const ManageTasks: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  
  const [taskForm, setTaskForm] = useState({ 
    title: '', 
    description: '', 
    userId: '', 
    progress: 0,
    steps: [] as { title: string; completed: boolean }[]
  });
  const [newStep, setNewStep] = useState('');
  const [availableServices, setAvailableServices] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      fetchTasksForClient(selectedClientId);
      setTaskForm(prev => ({ ...prev, userId: selectedClientId }));
    } else {
      fetchAllTasks();
    }
  }, [selectedClientId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [usersRes, servicesRes] = await Promise.all([
        adminApi.getUsers(),
        servicesApi.getServices()
      ]);
      
      if (usersRes.data.success) setClients(usersRes.data.users);
      if (servicesRes.data.success) setAvailableServices(servicesRes.data.services);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTasks = async () => {
    try {
      setLoading(true);
      // Assuming we have a way to get all tasks across all users for admin
      // For now, we'll just show "Select a client" or implement a "All Tasks" view
      // If the backend doesn't support getTasks() without userId, we might need a new endpoint
      // Let's check backend/routes/tasks.js
      const res = await tasksApi.getTasks(''); // Empty string for all?
      if (res.data.success) setTasks(res.data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksForClient = async (userId: string) => {
    try {
      setLoading(true);
      const res = await tasksApi.getTasks(userId);
      if (res.data.success) setTasks(res.data.tasks);
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
        setIsAssigning(false);
        if (selectedClientId) fetchTasksForClient(selectedClientId);
        else fetchAllTasks();
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteTask = async (e: React.MouseEvent, taskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await tasksApi.deleteTask(taskId);
      if (res.data.success) {
        if (selectedClientId) fetchTasksForClient(selectedClientId);
        else fetchAllTasks();
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

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  const selectedClient = clients.find(c => c._id === selectedClientId);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-in fade-in duration-500">
      {/* Header Bar */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 border border-mnkhan-gray-border rounded-sm shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-mnkhan-charcoal p-2 rounded-sm text-white">
            <ClipboardList size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-mnkhan-charcoal">Global Matter Management</h2>
            <p className="text-[10px] text-mnkhan-text-muted uppercase tracking-widest font-bold">Administrate Workflow & Communications</p>
          </div>
        </div>
        <div className="flex gap-3">
          {selectedClientId && (
            <button 
              onClick={() => setSelectedClientId(null)}
              className="px-4 py-2.5 bg-mnkhan-gray-light/20 text-mnkhan-charcoal font-bold uppercase tracking-widest text-[9px] rounded-sm border border-mnkhan-gray-border hover:bg-mnkhan-gray-light transition-all"
            >
              Show All Matters
            </button>
          )}
          <button 
            onClick={() => setIsAssigning(!isAssigning)}
            className={`flex items-center gap-2 px-6 py-2.5 font-bold uppercase tracking-widest text-[10px] transition-all rounded-sm ${
              isAssigning ? 'bg-mnkhan-orange text-white shadow-lg' : 'bg-mnkhan-charcoal text-white hover:bg-mnkhan-orange'
            }`}
          >
            {isAssigning ? 'Close Form' : <><Plus size={14} /> Assign Matter</>}
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left Sidebar: Client Selector */}
        <div className="w-80 flex flex-col bg-white border border-mnkhan-gray-border rounded-sm shadow-sm overflow-hidden">
          <div className="p-4 border-b border-mnkhan-gray-border bg-mnkhan-gray-light/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mnkhan-text-muted" size={14} />
              <input 
                type="text"
                placeholder="Search Clients..."
                value={clientSearchTerm}
                onChange={e => setClientSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-mnkhan-gray-border focus:border-mnkhan-orange outline-none transition-colors rounded-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <button 
              onClick={() => setSelectedClientId(null)}
              className={`w-full flex items-center gap-3 p-4 text-left border-b border-mnkhan-gray-light hover:bg-mnkhan-gray-light/10 transition-colors ${
                selectedClientId === null ? 'bg-mnkhan-orange/5 border-l-4 border-l-mnkhan-orange pl-3' : 'border-l-4 border-l-transparent'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                selectedClientId === null ? 'bg-mnkhan-orange text-white' : 'bg-mnkhan-gray-border text-mnkhan-charcoal'
              }`}>
                <Users size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold truncate ${selectedClientId === null ? 'text-mnkhan-orange' : 'text-mnkhan-charcoal'}`}>
                  All Clients
                </p>
                <p className="text-[10px] text-mnkhan-text-muted truncate">Consolidated View</p>
              </div>
            </button>
            {filteredClients.map(client => (
              <button
                key={client._id}
                onClick={() => {
                  setSelectedClientId(client._id);
                  setIsAssigning(false);
                }}
                className={`w-full flex items-center gap-3 p-4 text-left border-b border-mnkhan-gray-light hover:bg-mnkhan-gray-light/10 transition-colors ${
                  selectedClientId === client._id ? 'bg-mnkhan-orange/5 border-l-4 border-l-mnkhan-orange pl-3' : 'border-l-4 border-l-transparent'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  selectedClientId === client._id ? 'bg-mnkhan-orange text-white' : 'bg-mnkhan-gray-border text-mnkhan-charcoal'
                }`}>
                  {client.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${selectedClientId === client._id ? 'text-mnkhan-orange' : 'text-mnkhan-charcoal'}`}>
                    {client.name}
                  </p>
                  <p className="text-[10px] text-mnkhan-text-muted truncate">{client.email}</p>
                </div>
                <ChevronRight size={14} className={selectedClientId === client._id ? 'text-mnkhan-orange' : 'text-mnkhan-gray-border'} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Detail: Task Feed or Assign Form */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {isAssigning ? (
            <div className="flex-1 bg-white border border-mnkhan-gray-border rounded-sm shadow-sm overflow-y-auto custom-scrollbar p-8">
              <div className="max-w-2xl mx-auto w-full animate-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-2xl font-serif italic mb-2 text-mnkhan-charcoal">Assign New Legal Matter</h3>
                <p className="text-xs text-mnkhan-text-muted mb-8 border-b border-mnkhan-gray-border pb-4">Define a new case or task for a client account.</p>
                
                <form onSubmit={handleCreateTask} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Target Client</label>
                      <select 
                        required
                        value={taskForm.userId}
                        onChange={e => setTaskForm({...taskForm, userId: e.target.value})}
                        className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none bg-transparent text-sm"
                      >
                        <option value="">Select a Client</option>
                        {clients.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Template Service</label>
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
                        className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none bg-transparent text-sm italic"
                      >
                        <option value="">Manual Entry (No Template)</option>
                        {availableServices.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Matter Title</label>
                    <input 
                      type="text" required
                      value={taskForm.title}
                      onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                      placeholder="e.g. Trademark Registration - [Client Name]"
                      className="w-full text-lg border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-4 bg-mnkhan-gray-light/5 p-6 rounded-sm border border-mnkhan-gray-border border-dashed">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Workflow Milestones</label>
                      <span className="text-[9px] text-mnkhan-orange font-bold uppercase tracking-tighter">Auto-calculates progress based on completion</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={newStep}
                        onChange={e => setNewStep(e.target.value)}
                        placeholder="Add a milestone step..."
                        className="flex-1 bg-white border border-mnkhan-gray-border px-4 py-2 outline-none text-xs rounded-sm"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStep())}
                      />
                      <button 
                        type="button"
                        onClick={handleAddStep}
                        className="bg-mnkhan-charcoal text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-mnkhan-orange transition-all rounded-sm"
                      >
                        Add
                      </button>
                    </div>

                    <div className="space-y-2">
                      {taskForm.steps.map((step, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-white p-3 rounded border border-mnkhan-gray-border group">
                          <span className="font-medium text-mnkhan-charcoal">{idx + 1}. {step.title}</span>
                          <button type="button" onClick={() => handleRemoveStep(idx)} className="text-red-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {!taskForm.steps.length && (
                        <div className="py-4 text-center">
                          <p className="text-[10px] text-mnkhan-text-muted italic uppercase tracking-widest">No milestones defined yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Detailed Description / Instructions</label>
                    <textarea 
                      required
                      value={taskForm.description}
                      onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                      placeholder="Enter case details or specific instructions for the legal team..."
                      className="w-full border border-mnkhan-gray-border focus:border-mnkhan-orange p-4 outline-none h-32 text-sm resize-none rounded-sm"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="submit" 
                      className="flex-1 bg-mnkhan-charcoal text-white py-4 font-bold uppercase tracking-widest text-xs hover:bg-mnkhan-orange hover:shadow-lg hover:shadow-mnkhan-orange/20 transition-all rounded-sm flex items-center justify-center gap-2"
                    >
                      <Plus size={16} /> Assign Legal Matter
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsAssigning(false)}
                      className="px-8 border border-mnkhan-gray-border font-bold uppercase tracking-widest text-xs hover:bg-mnkhan-gray-light transition-colors rounded-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col bg-mnkhan-gray-light/5 overflow-hidden">
              <div className="p-6 bg-white border border-mnkhan-gray-border rounded-sm shadow-sm flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-mnkhan-charcoal">
                    {selectedClientId ? selectedClient?.name : 'Consolidated Matter Feed'}
                  </h3>
                  <p className="text-xs text-mnkhan-text-muted">
                    {selectedClientId ? `${selectedClient?.email} • ${tasks.length} Active Matters` : `${tasks.length} Matters across all clients`}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-mnkhan-gray-light/20 px-3 py-1.5 rounded-sm border border-mnkhan-gray-border text-mnkhan-text-muted">
                  <Filter size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Grid View Optimized</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-40">
                    <Clock className="text-mnkhan-orange mb-4 animate-spin" size={40} />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Indexing Legal Matters...</p>
                  </div>
                ) : tasks.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-4">
                    {tasks.map((t: any) => (
                      <Link 
                        key={t._id} 
                        to={`/portal/admin-tasks/${t._id}`}
                        className="bg-white border border-mnkhan-gray-border rounded-sm hover:border-mnkhan-orange hover:shadow-xl transition-all group relative overflow-hidden flex flex-col h-full"
                      >
                        <div className="p-6 flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <div className="bg-mnkhan-gray-light/30 p-2.5 rounded-sm text-mnkhan-charcoal group-hover:bg-mnkhan-orange/10 group-hover:text-mnkhan-orange transition-colors">
                              <Briefcase size={20} />
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm text-white ${
                                t.status === 'completed' ? 'bg-green-600' : 
                                t.status === 'in-progress' ? 'bg-mnkhan-orange' : 'bg-mnkhan-charcoal'
                              }`}>
                                {t.status}
                              </span>
                              {!selectedClientId && (
                                <span className="text-[8px] font-bold text-mnkhan-text-muted uppercase tracking-tighter bg-mnkhan-gray-light px-1.5 rounded-sm truncate max-w-[100px]">
                                  {clients.find(c => c._id === t.userId)?.name || 'Unknown Client'}
                                </span>
                              )}
                            </div>
                          </div>

                          <h4 className="font-bold text-mnkhan-charcoal text-sm mb-2 line-clamp-1 group-hover:text-mnkhan-orange transition-colors">{t.title}</h4>
                          <p className="text-[11px] text-mnkhan-text-muted line-clamp-2 leading-relaxed mb-6 h-8">
                            {t.description}
                          </p>

                          {/* Progress Line */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Progress</span>
                              <span className="text-[10px] font-bold text-mnkhan-charcoal">{t.progress}%</span>
                            </div>
                            <div className="w-full h-1 bg-mnkhan-gray-light rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-mnkhan-orange transition-all duration-700 ease-out"
                                style={{ width: `${t.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="px-6 py-4 bg-mnkhan-gray-light/10 border-t border-mnkhan-gray-border flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Clock size={12} className="text-mnkhan-text-muted" />
                            <span className="text-[9px] font-bold text-mnkhan-text-muted uppercase">
                              Updated {new Date(t.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => handleDeleteTask(e, t._id)}
                              className="p-2 text-mnkhan-text-muted hover:text-red-500 hover:bg-red-50 rounded-sm transition-all opacity-0 group-hover:opacity-100"
                              title="Delete Matter"
                            >
                              <Trash2 size={14} />
                            </button>
                            <div className="p-2 text-mnkhan-orange hover:bg-mnkhan-orange/10 rounded-sm transition-all">
                              <ExternalLink size={14} />
                            </div>
                          </div>
                        </div>
                        
                        {/* Interactive Hover Overlay (Subtle) */}
                        <div className="absolute top-0 right-0 w-12 h-12 bg-mnkhan-orange/5 rounded-bl-full translate-x-12 -translate-y-12 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="bg-white p-8 rounded-full shadow-sm text-mnkhan-gray-border mb-6 border border-mnkhan-gray-border">
                      <Briefcase size={48} />
                    </div>
                    <h4 className="text-lg font-bold text-mnkhan-charcoal mb-2">No Active Matters Found</h4>
                    <p className="text-xs text-mnkhan-text-muted max-w-xs mx-auto">No matters found matching your selection. Start by assigning a new legal matter to a client.</p>
                    <button 
                      onClick={() => setIsAssigning(true)}
                      className="mt-6 px-6 py-2 bg-mnkhan-orange text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:shadow-lg transition-all"
                    >
                      Assign First Matter
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageTasks;
