import React, { useState, useEffect } from 'react';
import * as servicesApi from '../../api/services';

const ManageServices: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const initialForm = {
    name: '',
    description: '',
    price: '',
    details: '',
    criteria: '',
    servicer: '',
    acceptanceCreteria: '',
    defaultSteps: [] as string[]
  };

  const [form, setForm] = useState(initialForm);
  const [newStep, setNewStep] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await servicesApi.getServices();
      if (res.data.success) setServices(res.data.services);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editId) {
        const res = await servicesApi.updateService(editId, form);
        if (res.data.success) {
          setIsEditing(false);
          setEditId(null);
          setForm(initialForm);
          fetchServices();
        }
      } else {
        const res = await servicesApi.createService(form);
        if (res.data.success) {
          setForm(initialForm);
          fetchServices();
        }
      }
    } catch (err) { console.error(err); }
  };

  const handleEditClick = (s: any) => {
    setIsEditing(true);
    setEditId(s._id);
    setForm({
      name: s.name || '',
      description: s.description || '',
      price: s.price || '',
      details: s.details || '',
      criteria: s.criteria || '',
      servicer: s.servicer || '',
      acceptanceCreteria: s.acceptanceCreteria || '',
      defaultSteps: s.defaultSteps || []
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setForm(initialForm);
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      const res = await servicesApi.deleteService(id);
      if (res.data.success) fetchServices();
    } catch (err) { console.error(err); }
  };

  const addStep = () => {
    if (newStep.trim()) {
      setForm({ ...form, defaultSteps: [...form.defaultSteps, newStep.trim()] });
      setNewStep('');
    }
  };

  const removeStep = (index: number) => {
    setForm({ ...form, defaultSteps: form.defaultSteps.filter((_, i) => i !== index) });
  };

  return (
    <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-500">
      <div className="col-span-12 lg:col-span-4">
        <div className="bg-white p-8 rounded-sm shadow-sm border border-mnkhan-gray-border sticky top-24">
          <h3 className="text-xl font-serif italic mb-6 text-mnkhan-charcoal">
            {isEditing ? 'Edit Service' : 'Add New Service'}
          </h3>
          <form onSubmit={handleCreateService} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Service Name</label>
              <input 
                type="text" required
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="e.g. Trademark Registration"
                className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Price (e.g. ₹28,000)</label>
              <input 
                type="text" required
                value={form.price}
                onChange={e => setForm({...form, price: e.target.value})}
                className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Short Description</label>
              <textarea 
                required
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none h-20 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Details (Full Content)</label>
              <textarea 
                value={form.details}
                onChange={e => setForm({...form, details: e.target.value})}
                className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none h-20 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Criteria</label>
              <textarea 
                value={form.criteria}
                onChange={e => setForm({...form, criteria: e.target.value})}
                className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none h-20 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted font-bold text-mnkhan-orange">NEW: Service Provided</label>
              <textarea 
                value={form.servicer}
                onChange={e => setForm({...form, servicer: e.target.value})}
                placeholder="Content for 'Service Provided' section"
                className="w-full border-b-2 border-mnkhan-orange/30 focus:border-mnkhan-orange py-2 outline-none h-20 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted font-bold text-mnkhan-orange">NEW: Acceptance Criteria</label>
              <textarea 
                value={form.acceptanceCreteria}
                onChange={e => setForm({...form, acceptanceCreteria: e.target.value})}
                placeholder="Content for 'Acceptance Criteria' section"
                className="w-full border-b-2 border-mnkhan-orange/30 focus:border-mnkhan-orange py-2 outline-none h-20 text-sm"
              />
            </div>

            <div className="space-y-3 pt-4 border-t border-mnkhan-gray-border">
              <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Default Matter Steps</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newStep}
                  onChange={e => setNewStep(e.target.value)}
                  placeholder="e.g. Documents Verification"
                  className="flex-1 border-b border-mnkhan-gray-border focus:border-mnkhan-orange py-1 outline-none text-xs"
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addStep())}
                />
                <button type="button" onClick={addStep} className="bg-mnkhan-charcoal text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">Add</button>
              </div>
              <div className="space-y-2">
                {form.defaultSteps.map((s, i) => (
                  <div key={i} className="flex justify-between items-center text-[11px] bg-mnkhan-gray-light/10 p-2 rounded">
                    <span>{s}</span>
                    <button type="button" onClick={() => removeStep(i)} className="text-red-500 font-bold">×</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button type="submit" className="w-full bg-mnkhan-charcoal text-white py-3 font-bold uppercase tracking-widest text-xs hover:bg-mnkhan-orange transition-all">
                {isEditing ? 'Update Service' : 'Create Service'}
              </button>
              {isEditing && (
                <button 
                  type="button" 
                  onClick={cancelEdit}
                  className="w-full bg-gray-200 text-gray-700 py-3 font-bold uppercase tracking-widest text-xs hover:bg-gray-300 transition-all"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-8">
        <div className="bg-white p-8 rounded-sm shadow-sm border border-mnkhan-gray-border">
          <h3 className="text-xl font-bold text-mnkhan-charcoal mb-8">Active Services</h3>
          <div className="space-y-4">
            {loading ? (
              <p className="text-center py-10 italic text-mnkhan-text-muted">Loading services...</p>
            ) : services.length > 0 ? (
              services.map((s: any) => (
                <div key={s._id} className="p-6 border border-mnkhan-gray-border rounded-sm flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-bold text-mnkhan-charcoal">{s.name}</h4>
                    <p className="text-xs text-mnkhan-text-muted mt-1">{s.description}</p>
                    <p className="text-xs font-bold text-mnkhan-orange mt-2">{s.price}</p>
                    
                    {/* Display new fields preview in dashboard */}
                    {(s.servicer || s.acceptanceCreteria) && (
                      <div className="mt-3 flex gap-4 text-[9px] uppercase tracking-tighter text-gray-400">
                        {s.servicer && <span>✓ Service Provided Set</span>}
                        {s.acceptanceCreteria && <span>✓ Criteria Set</span>}
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      {s.defaultSteps?.map((step: string, idx: number) => (
                        <span key={idx} className="text-[8px] bg-mnkhan-gray-light px-2 py-0.5 rounded-full text-mnkhan-text-muted">{step}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <button 
                      onClick={() => handleEditClick(s)}
                      className="text-mnkhan-charcoal hover:text-mnkhan-orange text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteService(s._id)}
                      className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase tracking-widest"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : <p className="text-center py-10 italic text-mnkhan-text-muted">No services found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageServices;
