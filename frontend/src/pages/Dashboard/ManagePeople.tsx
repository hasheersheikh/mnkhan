import React, { useState, useEffect } from 'react';
import * as peopleApi from '../../api/people';

const ManagePeople: React.FC = () => {
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [personForm, setPersonForm] = useState({ name: '', title: '', expertise: '', bio: '', initials: '' });
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);

  useEffect(() => {
    fetchPeopleData();
  }, []);

  const fetchPeopleData = async () => {
    try {
      setLoading(true);
      const res = await peopleApi.getPeople();
      if (res.data.success) {
        // Ensure people are sorted by order
        const sortedPeople = [...res.data.people].sort((a, b) => (a.order || 0) - (b.order || 0));
        setPeople(sortedPeople);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    try {
      const orders = people.map((p, idx) => ({ id: p._id, order: p.order || idx }));
      const res = await (peopleApi as any).reorderPeople(orders);
      if (res.data.success) {
        alert('Display order updated');
        fetchPeopleData();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update order');
    }
  };

  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (editingPersonId) {
        res = await peopleApi.updatePerson(editingPersonId, personForm);
      } else {
        res = await peopleApi.createPerson(personForm);
      }
      
      if (res.data.success) {
        setPersonForm({ name: '', title: '', expertise: '', bio: '', initials: '' });
        setEditingPersonId(null);
        fetchPeopleData();
      }
    } catch (err) { console.error(err); }
  };

  const handleEditPerson = (p: any) => {
    setPersonForm({
      name: p.name,
      title: p.title,
      expertise: p.expertise,
      bio: p.bio,
      initials: p.initials || ''
    });
    setEditingPersonId(p._id);
  };

  const handleDeletePerson = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this professional?')) {
      try {
        const res = await peopleApi.deletePerson(id);
        if (res.data.success) {
          fetchPeopleData();
        }
      } catch (err) { console.error(err); }
    }
  };

  return (
    <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-500">
      <div className="col-span-12 lg:col-span-4">
        <div className="bg-white p-8 rounded-sm shadow-sm border border-mnkhan-gray-border">
          <h3 className="text-xl font-serif italic mb-6 text-mnkhan-charcoal">
            {editingPersonId ? 'Edit Profile' : 'Onboard Professional'}
          </h3>
          <form onSubmit={handleCreatePerson} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Full Name</label>
              <input 
                type="text" required
                value={personForm.name}
                onChange={e => setPersonForm({...personForm, name: e.target.value})}
                className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Title</label>
                <input 
                  type="text" required
                  value={personForm.title}
                  onChange={e => setPersonForm({...personForm, title: e.target.value})}
                  className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none"
                />
              </div>
              <div className="w-20 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Initials</label>
                <input 
                  type="text" required
                  value={personForm.initials}
                  onChange={e => setPersonForm({...personForm, initials: e.target.value})}
                  className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Expertise</label>
              <input 
                type="text" required
                value={personForm.expertise}
                onChange={e => setPersonForm({...personForm, expertise: e.target.value})}
                className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Biography</label>
              <textarea 
                required
                value={personForm.bio}
                onChange={e => setPersonForm({...personForm, bio: e.target.value})}
                className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none h-24"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-mnkhan-charcoal text-white py-3 font-bold uppercase tracking-widest text-xs hover:bg-mnkhan-orange transition-all">
                {editingPersonId ? 'Update Profile' : 'Register Professional'}
              </button>
              {editingPersonId && (
                <button 
                  type="button" 
                  onClick={() => {
                    setEditingPersonId(null);
                    setPersonForm({ name: '', title: '', expertise: '', bio: '', initials: '' });
                  }}
                  className="px-6 border border-mnkhan-gray-border font-bold uppercase tracking-widest text-[10px] hover:bg-mnkhan-gray-light/10"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-8">
        <div className="bg-white p-8 rounded-sm shadow-sm border border-mnkhan-gray-border min-h-[600px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-mnkhan-charcoal">Team Members</h3>
            <button 
              onClick={handleUpdateOrder}
              className="px-4 py-2 bg-mnkhan-orange text-white text-[10px] font-bold uppercase tracking-widest hover:bg-mnkhan-charcoal transition-all"
            >
              Save Order
            </button>
          </div>
          <div className="space-y-4">
            {loading ? (
              <p className="text-mnkhan-text-muted italic text-sm text-center py-20">Updating records...</p>
            ) : people.length > 0 ? (
              people.map(p => (
                <div key={p._id} className="p-6 border border-mnkhan-gray-border rounded-sm group hover:border-mnkhan-orange transition-colors animate-in fade-in duration-300">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-10">
                        <input 
                          type="number"
                          value={p.order || 0}
                          onChange={e => {
                            const newPeople = [...people];
                            const idx = newPeople.findIndex(person => person._id === p._id);
                            newPeople[idx] = { ...newPeople[idx], order: parseInt(e.target.value) || 0 };
                            setPeople(newPeople);
                          }}
                          className="w-full border-b border-mnkhan-gray-border text-center text-xs focus:border-mnkhan-orange outline-none"
                          title="Display Order"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-mnkhan-charcoal">{p.name}</h4>
                        <p className="text-xs text-mnkhan-text-muted">{p.title}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-center">
                      <p className="text-[10px] font-bold text-mnkhan-orange uppercase tracking-widest mr-4">{p.expertise.split(',')[0]}...</p>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditPerson(p)}
                          className="text-mnkhan-charcoal hover:text-mnkhan-orange text-xs font-bold uppercase tracking-widest"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeletePerson(p._id)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-widest"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : <p className="text-mnkhan-text-muted italic text-sm text-center py-20">No professional profiles registered.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePeople;
