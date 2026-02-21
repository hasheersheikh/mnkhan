import React, { useState, useEffect } from "react";
import * as servicesApi from "../../api/services";
import {
  Briefcase,
  Tag,
  Layers,
  ListChecks,
  Edit3,
  Trash2,
  IndianRupee,
  Plus,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  X,
  FileText,
} from "lucide-react";

const ManageServices: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const initialForm = {
    name: "",
    description: "",
    price: "",
    details: "",
    criteria: "",
    servicer: "",
    acceptanceCreteria: "",
    defaultSteps: [] as string[],
    requiredDocuments: [] as string[],
  };

  const [form, setForm] = useState(initialForm);
  const [newStep, setNewStep] = useState("");
  const [newDoc, setNewDoc] = useState("");

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
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (s: any) => {
    setIsEditing(true);
    setEditId(s._id);
    setForm({
      name: s.name || "",
      description: s.description || "",
      price: s.price || "",
      details: s.details || "",
      criteria: s.criteria || "",
      servicer: s.servicer || "",
      acceptanceCreteria: s.acceptanceCreteria || "",
      defaultSteps: s.defaultSteps || [],
      requiredDocuments: s.requiredDocuments || [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setForm(initialForm);
  };

  const handleDeleteService = async (id: string) => {
    if (
      !window.confirm(
        "Delete this legal service? This action cannot be undone.",
      )
    )
      return;
    try {
      const res = await servicesApi.deleteService(id);
      if (res.data.success) fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const addStep = () => {
    if (newStep.trim()) {
      setForm({
        ...form,
        defaultSteps: [...form.defaultSteps, newStep.trim()],
      });
      setNewStep("");
    }
  };

  const removeStep = (index: number) => {
    setForm({
      ...form,
      defaultSteps: form.defaultSteps.filter((_, i) => i !== index),
    });
  };

  const addDoc = () => {
    if (newDoc.trim()) {
      setForm({
        ...form,
        requiredDocuments: [...form.requiredDocuments, newDoc.trim()],
      });
      setNewDoc("");
    }
  };

  const removeDoc = (index: number) => {
    setForm({
      ...form,
      requiredDocuments: form.requiredDocuments.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end border-b border-mnkhan-gray-border pb-6">
        <div>
          <h2 className="text-3xl font-serif italic text-mnkhan-charcoal mb-2">
            Legal Product Catalog
          </h2>
          <p className="text-mnkhan-text-muted text-[10px] font-bold uppercase tracking-[0.3em]">
            Service Portfolio Management
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-mnkhan-orange/10 text-mnkhan-orange rounded-sm border border-mnkhan-orange/20">
          <Layers size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {services.length} Active Services
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Service Form Sidebar */}
        <div className="col-span-12 lg:col-span-4 self-start sticky top-24">
          <div className="bg-white p-8 rounded-sm shadow-sm border border-mnkhan-gray-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-mnkhan-orange/5 rounded-full -mr-16 -mt-16 blur-3xl" />

            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="bg-mnkhan-charcoal p-2 rounded-sm text-white">
                <Plus size={20} />
              </div>
              <h3 className="text-xl font-serif italic text-mnkhan-charcoal">
                {isEditing ? "Modify Service" : "Design New Service"}
              </h3>
            </div>

            <form
              onSubmit={handleCreateService}
              className="space-y-6 relative z-10"
            >
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal flex items-center gap-2">
                  <Briefcase size={10} className="text-mnkhan-orange" />
                  Service Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trademark Registration"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-mnkhan-gray-light/10 border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange px-1 py-3 outline-none text-sm transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal flex items-center gap-2">
                  <IndianRupee size={10} className="text-mnkhan-orange" />
                  Consultation Fee
                </label>
                <input
                  type="text"
                  required
                  placeholder="₹28,500"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full bg-mnkhan-gray-light/10 border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange px-1 py-3 outline-none text-sm transition-colors font-serif italic"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal">
                  Short Prospectus
                </label>
                <textarea
                  required
                  placeholder="Quick summary for the card view..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full bg-mnkhan-gray-light/10 border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange px-1 py-3 outline-none h-24 text-sm resize-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal">
                  Service Provided (Full Details)
                </label>
                <textarea
                  placeholder="Detailed explanation of what the service includes..."
                  value={form.servicer}
                  onChange={(e) =>
                    setForm({ ...form, servicer: e.target.value })
                  }
                  className="w-full bg-mnkhan-gray-light/10 border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange px-1 py-3 outline-none h-24 text-sm resize-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal">
                  Acceptance Criteria
                </label>
                <textarea
                  placeholder="Requirements or eligibility for this service..."
                  value={form.acceptanceCreteria}
                  onChange={(e) =>
                    setForm({ ...form, acceptanceCreteria: e.target.value })
                  }
                  className="w-full bg-mnkhan-gray-light/10 border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange px-1 py-3 outline-none h-24 text-sm resize-none transition-colors"
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-mnkhan-gray-border">
                <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal flex items-center gap-2">
                  <ListChecks size={14} className="text-mnkhan-orange" />
                  Matter Workflow Builder
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newStep}
                    onChange={(e) => setNewStep(e.target.value)}
                    placeholder="Add milestone (e.g. Filing)"
                    className="flex-1 bg-mnkhan-gray-light/10 border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange px-2 py-2 outline-none text-xs transition-colors"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addStep())
                    }
                  />
                  <button
                    type="button"
                    onClick={addStep}
                    className="bg-mnkhan-charcoal text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-mnkhan-orange transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {form.defaultSteps.map((s, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest bg-mnkhan-gray-light/20 p-2.5 rounded border border-mnkhan-gray-border/50 group animate-in slide-in-from-left-2"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-mnkhan-orange">{i + 1}.</span> {s}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeStep(i)}
                        className="text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {form.defaultSteps.length === 0 && (
                    <p className="text-[9px] text-mnkhan-text-muted italic opacity-60 text-center py-2">
                      No milestones defined yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Required Documents Section */}
              <div className="space-y-4 pt-4 border-t border-mnkhan-gray-border">
                <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal flex items-center gap-2">
                  <FileText size={14} className="text-mnkhan-orange" />
                  Prerequisite Documents
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDoc}
                    onChange={(e) => setNewDoc(e.target.value)}
                    placeholder="Document name (e.g. PAN Card)"
                    className="flex-1 bg-mnkhan-gray-light/10 border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange px-2 py-2 outline-none text-xs transition-colors"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addDoc())
                    }
                  />
                  <button
                    type="button"
                    onClick={addDoc}
                    className="bg-mnkhan-charcoal text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-mnkhan-orange transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {form.requiredDocuments.map((d, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest bg-mnkhan-gray-light/20 p-2.5 rounded border border-mnkhan-gray-border/50 group animate-in slide-in-from-left-2"
                    >
                      <span className="flex items-center gap-2 text-mnkhan-charcoal">
                        <Tag size={10} className="text-mnkhan-orange" /> {d}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeDoc(i)}
                        className="text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {form.requiredDocuments.length === 0 && (
                    <p className="text-[9px] text-mnkhan-text-muted italic opacity-60 text-center py-2">
                      No documents required yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-6">
                <button
                  type="submit"
                  className="w-full bg-mnkhan-charcoal text-white py-4 font-bold uppercase tracking-widest text-[10px] hover:bg-mnkhan-orange transition-all shadow-md"
                >
                  {isEditing ? "Commit Product Updates" : "Launch New Service"}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="w-full border border-mnkhan-gray-border text-mnkhan-text-muted py-4 font-bold uppercase tracking-widest text-[9px] hover:bg-mnkhan-gray-light/10 transition-colors"
                  >
                    Discard Changes
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Services Grid */}
        <div className="col-span-12 lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-40 opacity-30">
                <div className="w-10 h-10 border-4 border-mnkhan-orange border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-widest italic tracking-[0.3em]">
                  Auditing Catalog...
                </p>
              </div>
            ) : services.length > 0 ? (
              services.map((s: any, idx: number) => (
                <div
                  key={s._id}
                  className="bg-white border border-mnkhan-gray-border p-8 rounded-sm shadow-sm flex flex-col relative group hover:border-mnkhan-orange transition-all duration-500 hover:shadow-xl hover:shadow-mnkhan-charcoal/5 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tag size={16} className="text-mnkhan-orange/20" />
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-serif italic text-mnkhan-charcoal group-hover:text-mnkhan-orange transition-colors">
                        {s.name}
                      </h4>
                      <span className="bg-mnkhan-charcoal text-white text-[10px] font-bold px-3 py-1 rounded-sm shadow-sm border border-mnkhan-orange/30">
                        {s.price}
                      </span>
                    </div>
                    <p className="text-xs text-mnkhan-text-muted leading-relaxed line-clamp-2 italic">
                      "{s.description}"
                    </p>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-2">
                      <div className="h-0.5 flex-1 bg-mnkhan-gray-border" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-mnkhan-text-muted">
                        Lifecycle Milestones
                      </span>
                      <div className="h-0.5 flex-1 bg-mnkhan-gray-border" />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {s.defaultSteps?.length > 0 ? (
                        s.defaultSteps.map((step: string, si: number) => (
                          <span
                            key={si}
                            className="text-[8px] bg-mnkhan-gray-light/30 border border-mnkhan-gray-border/50 text-mnkhan-charcoal px-2 py-1 rounded-sm font-bold uppercase tracking-tighter"
                          >
                            {step}
                          </span>
                        ))
                      ) : (
                        <span className="text-[8px] text-mnkhan-text-muted italic opacity-50">
                          No default workflow defined
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="h-0.5 flex-1 bg-mnkhan-gray-border" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-mnkhan-text-muted">
                        Prerequisites
                      </span>
                      <div className="h-0.5 flex-1 bg-mnkhan-gray-border" />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {s.requiredDocuments?.length > 0 ? (
                        s.requiredDocuments.map((doc: string, di: number) => (
                          <span
                            key={di}
                            className="text-[8px] bg-mnkhan-orange/5 border border-mnkhan-orange/20 text-mnkhan-charcoal px-2 py-1 rounded-sm font-bold uppercase tracking-tighter"
                          >
                            {doc}
                          </span>
                        ))
                      ) : (
                        <span className="text-[8px] text-mnkhan-text-muted italic opacity-50">
                          No prerequisites defined
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto flex justify-between items-center pt-6 border-t border-mnkhan-gray-border border-dotted">
                    <div className="flex gap-4">
                      {s.servicer && (
                        <div className="flex items-center gap-1 text-[8px] font-bold uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded-sm">
                          <CheckCircle2 size={8} />
                          Details
                        </div>
                      )}
                      {s.acceptanceCreteria && (
                        <div className="flex items-center gap-1 text-[8px] font-bold uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-sm">
                          <AlertCircle size={8} />
                          Criteria
                        </div>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleEditClick(s)}
                        className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-mnkhan-charcoal hover:text-mnkhan-orange transition-colors"
                      >
                        <Edit3 size={12} />
                        Modify
                      </button>
                      <button
                        onClick={() => handleDeleteService(s._id)}
                        className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
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
                <LayoutGrid size={64} className="mb-4 text-mnkhan-charcoal" />
                <p className="text-xs font-bold uppercase tracking-widest italic tracking-[0.2em]">
                  Service Catalog is Empty
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageServices;
