import React, { useState, useEffect } from 'react';
import * as peopleApi from '../../api/people';
import { 
  UserPlus, 
  Mail, 
  Award, 
  ArrowUpDown, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  Globe,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

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
      const orders = people.map((p, idx) => ({ id: p._id, order: idx }));
      const res = await (peopleApi as any).reorderPeople(orders);
      if (res.data.success) {
        fetchPeopleData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newPeople = [...people];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newPeople.length) return;
    
    [newPeople[index], newPeople[newIndex]] = [newPeople[newIndex], newPeople[index]];
    setPeople(newPeople);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end border-b border-mnkhan-gray-border pb-6">
        <div>
          <h2 className="text-3xl font-serif italic text-mnkhan-charcoal mb-2">Professional Directory</h2>
          <p className="text-mnkhan-text-muted text-[10px] font-bold uppercase tracking-[0.3em]">Institutional Talent Management</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleUpdateOrder}
            className="flex items-center gap-2 px-6 py-2.5 bg-mnkhan-charcoal text-white text-[10px] font-bold uppercase tracking-widest hover:bg-mnkhan-orange transition-all shadow-lg"
          >
            <ArrowUpDown size={14} />
            Commit Order Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Form Sidebar */}
        <div className="col-span-12 lg:col-span-4 self-start sticky top-24">
          <div className="bg-white p-8 rounded-sm shadow-sm border border-mnkhan-gray-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-mnkhan-orange/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="bg-mnkhan-orange/10 p-2 rounded-sm text-mnkhan-orange">
                <UserPlus size={20} />
              </div>
              <h3 className="text-xl font-serif italic text-mnkhan-charcoal">
                {editingPersonId ? 'Modify Profile' : 'Onboard Professional'}
              </h3>
            </div>

            <form onSubmit={handleCreatePerson} className="space-y-6 relative z-10">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal flex items-center gap-2">
                  <Globe size={10} className="text-mnkhan-orange" />
                  Full Designation Name
                </label>
                <input 
                  type="text" required
                  placeholder="e.g. Adv. Mansoor Khan"
                  value={personForm.name}
                  onChange={e => setPersonForm({...personForm, name: e.target.value})}
                  className="w-full bg-mnkhan-gray-light/10 border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange px-1 py-3 outline-none text-sm transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal">Official Title</label>
                  <input 
                    type="text" required
                    placeholder="Senior Counsel"
                    value={personForm.title}
                    onChange={e => setPersonForm({...personForm, title: e.target.value})}
                    className="w-full bg-mnkhan-gray-light/10 border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange px-1 py-3 outline-none text-sm transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal">Initials</label>
                  <input 
                    type="text" required
                    placeholder="MK"
                    maxLength={3}
                    value={personForm.initials}
                    onChange={e => setPersonForm({...personForm, initials: e.target.value})}
                    className="w-full bg-mnkhan-gray-light/10 border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange px-1 py-3 outline-none text-sm text-center font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal flex items-center gap-2">
                  <Award size={10} className="text-mnkhan-orange" />
                  Primary Expertise
                </label>
                <input 
                  type="text" required
                  placeholder="Corporate Law, Litigation, IP"
                  value={personForm.expertise}
                  onChange={e => setPersonForm({...personForm, expertise: e.target.value})}
                  className="w-full bg-mnkhan-gray-light/10 border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange px-1 py-3 outline-none text-sm transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal">Professional Narrative (Bio)</label>
                <textarea 
                  required
                  placeholder="Detail the professional's background and achievements..."
                  value={personForm.bio}
                  onChange={e => setPersonForm({...personForm, bio: e.target.value})}
                  className="w-full bg-mnkhan-gray-light/10 border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange px-1 py-3 outline-none h-32 text-sm resize-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button type="submit" className="w-full bg-mnkhan-charcoal text-white py-4 font-bold uppercase tracking-widest text-[10px] hover:bg-mnkhan-orange transition-all shadow-md group">
                  <span className="flex items-center justify-center gap-2">
                    {editingPersonId ? 'Update Legal Profile' : 'Register Official Profile'}
                    <ChevronDown size={14} className={`transition-transform duration-300 ${editingPersonId ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                {editingPersonId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingPersonId(null);
                      setPersonForm({ name: '', title: '', expertise: '', bio: '', initials: '' });
                    }}
                    className="w-full py-4 border border-mnkhan-gray-border text-mnkhan-text-muted font-bold uppercase tracking-widest text-[9px] hover:bg-mnkhan-gray-light/10 transition-colors"
                  >
                    Discard Changes
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="col-span-12 lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-40 opacity-30">
                <div className="w-10 h-10 border-4 border-mnkhan-orange border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-widest italic">Synchronizing Directory...</p>
              </div>
            ) : people.length > 0 ? (
              people.map((p, idx) => (
                <div 
                  key={p._id} 
                  className="bg-white border border-mnkhan-gray-border p-6 rounded-sm shadow-sm group hover:border-mnkhan-orange/50 hover:shadow-xl hover:shadow-mnkhan-charcoal/5 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-mnkhan-charcoal text-white rounded-sm flex items-center justify-center text-sm font-bold border border-mnkhan-orange shadow-inner">
                        {p.initials || p.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-mnkhan-charcoal group-hover:text-mnkhan-orange transition-colors">{p.name}</h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted opacity-70">{p.title}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => moveItem(idx, 'up')}
                        disabled={idx === 0}
                        className={`p-1 rounded-sm border transition-colors ${idx === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-mnkhan-orange/10 text-mnkhan-charcoal'}`}
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button 
                        onClick={() => moveItem(idx, 'down')}
                        disabled={idx === people.length - 1}
                        className={`p-1 rounded-sm border transition-colors ${idx === people.length - 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-mnkhan-orange/10 text-mnkhan-charcoal'}`}
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="mb-6 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {p.expertise.split(',').map((skill: string, si: number) => (
                        <span key={si} className="text-[9px] font-bold uppercase tracking-tighter bg-mnkhan-gray-light/30 text-mnkhan-charcoal px-2 py-1 rounded-sm border border-mnkhan-gray-border/50">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-mnkhan-text-muted leading-relaxed line-clamp-3 italic">
                      "{p.bio}"
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-mnkhan-gray-border mt-auto">
                    <div className="flex items-center gap-2 text-[9px] font-bold text-mnkhan-text-muted">
                      <Mail size={10} />
                      CONTACT READY
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleEditPerson(p)}
                        className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-mnkhan-charcoal hover:text-mnkhan-orange transition-colors px-2 py-1"
                      >
                        <Edit3 size={12} />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeletePerson(p._id)}
                        className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors px-2 py-1"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-32 opacity-20">
                <UserPlus size={64} className="mb-4 text-mnkhan-charcoal" />
                <p className="text-xs font-bold uppercase tracking-widest">No Professionals Registered</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePeople;
