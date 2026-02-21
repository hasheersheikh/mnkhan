import React, { useState, useEffect } from "react";
import * as adminApi from "../../api/admin";
import { UserPlus, Users, Search, Clock, Key, Trash2 } from "lucide-react";

const ManageStaff: React.FC = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [resetModal, setResetModal] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getStaff();
      if (res.data.success) setStaff(res.data.staff);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminApi.createStaff(form);
      if (res.data.success) {
        setMessage({
          type: "success",
          text: "Staff account created successfully.",
        });
        setForm({ name: "", email: "", password: "" });
        setIsAdding(false);
        fetchStaff();
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to create staff account.",
      });
    }
  };

  const handleResetPassword = async () => {
    if (!resetModal || !newPassword) return;
    try {
      const res = await adminApi.resetStaffPassword(resetModal.id, newPassword);
      if (res.data.success) {
        setMessage({
          type: "success",
          text: `Password for ${resetModal.name} has been reset.`,
        });
        setResetModal(null);
        setNewPassword("");
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStaff = async () => {
    if (!deleteModal) return;
    try {
      const res = await adminApi.deleteStaff(deleteModal.id);
      if (res.data.success) {
        setMessage({
          type: "success",
          text: `Staff member ${deleteModal.name} has been removed.`,
        });
        setDeleteModal(null);
        fetchStaff();
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to delete staff member.",
      });
    }
  };

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end border-b border-mnkhan-gray-border pb-6">
        <div>
          <h2 className="text-3xl font-serif italic text-mnkhan-charcoal mb-2">
            Firm Staff Directory
          </h2>
          <p className="text-mnkhan-text-muted text-[10px] font-bold uppercase tracking-[0.3em]">
            Access Management & Internal Team
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`px-6 py-2.5 font-bold uppercase tracking-widest text-[10px] transition-all rounded-sm shadow-lg ${
            isAdding
              ? "bg-mnkhan-orange text-white"
              : "bg-mnkhan-charcoal text-white hover:bg-mnkhan-orange"
          }`}
        >
          {isAdding ? (
            "Cancel Onboarding"
          ) : (
            <>
              <UserPlus size={14} className="inline mr-2" /> Onboard Staff
              Member
            </>
          )}
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-sm border ${message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"} animate-in slide-in-from-top-2 duration-300 text-xs font-bold uppercase tracking-widest`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-12 gap-8">
        {/* Form Overlay/Section */}
        {isAdding && (
          <div className="col-span-12 lg:col-span-4 animate-in slide-in-from-left-4 duration-500">
            <div className="bg-white p-8 rounded-sm shadow-sm border border-mnkhan-gray-border relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-mnkhan-orange/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              <h3 className="text-xl font-serif italic text-mnkhan-charcoal mb-6 relative z-10">
                New Staff Credentials
              </h3>

              <form
                onSubmit={handleCreateStaff}
                className="space-y-6 relative z-10"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abdullah Khan"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-mnkhan-gray-light/10 border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange px-1 py-3 outline-none text-sm transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="staff@mnkhan.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full bg-mnkhan-gray-light/10 border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange px-1 py-3 outline-none text-sm transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal">
                    Temporary Access Key (Password)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="w-full bg-mnkhan-gray-light/10 border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange px-1 py-3 outline-none text-sm transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-mnkhan-charcoal text-white py-4 font-bold uppercase tracking-widest text-[10px] hover:bg-mnkhan-orange transition-all shadow-md mt-4"
                >
                  Provision Account
                </button>
              </form>
            </div>
          </div>
        )}

        <div className={isAdding ? "col-span-12 lg:col-span-8" : "col-span-12"}>
          <div className="bg-white border border-mnkhan-gray-border rounded-sm shadow-sm overflow-hidden">
            <div className="p-4 border-b border-mnkhan-gray-border bg-mnkhan-gray-light/5 flex justify-between items-center">
              <div className="relative w-64">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-mnkhan-text-muted"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Filter team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-mnkhan-gray-border focus:border-mnkhan-orange outline-none transition-colors rounded-sm"
                />
              </div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-mnkhan-text-muted">
                Showing {filteredStaff.length} Firm Members
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-mnkhan-gray-light/5 text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal border-b border-mnkhan-gray-border">
                    <th className="p-4">Team Member</th>
                    <th className="p-4">Auth Channel</th>
                    <th className="p-4">Designation</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center opacity-40">
                        <Clock className="inline animate-spin mr-2" size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest italic">
                          Synchronizing Team Data...
                        </span>
                      </td>
                    </tr>
                  ) : filteredStaff.length > 0 ? (
                    filteredStaff.map((s) => (
                      <tr
                        key={s._id}
                        className="border-b border-mnkhan-gray-light hover:bg-mnkhan-gray-light/10 transition-colors group"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-mnkhan-charcoal text-white rounded-sm flex items-center justify-center text-[10px] font-bold border border-mnkhan-orange">
                              {s.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-bold text-mnkhan-charcoal">
                              {s.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-xs text-mnkhan-text-muted">
                          {s.email}
                        </td>
                        <td className="p-4">
                          <span className="text-[9px] font-bold uppercase tracking-widest bg-mnkhan-orange/10 text-mnkhan-orange px-2 py-1 rounded-sm border border-mnkhan-orange/20">
                            Firm Staff
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => {
                                setResetModal({ id: s._id, name: s.name });
                                setNewPassword("");
                              }}
                              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal hover:text-mnkhan-orange transition-colors"
                            >
                              <Key size={12} />
                              Reset Access
                            </button>
                            <button
                              onClick={() =>
                                setDeleteModal({ id: s._id, name: s.name })
                              }
                              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-12 text-center opacity-20">
                        <Users size={48} className="mx-auto mb-4" />
                        <p className="text-xs font-bold uppercase tracking-widest">
                          No Staff Records Found
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-mnkhan-charcoal/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md p-8 rounded-sm shadow-2xl border border-mnkhan-gray-border animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-serif italic text-mnkhan-charcoal mb-2">
              Reset Portal Access
            </h3>
            <p className="text-xs text-mnkhan-text-muted mb-8 italic">
              Generating new credentials for {resetModal.name}
            </p>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal">
                  Master Access Key
                </label>
                <input
                  type="password"
                  autoFocus
                  placeholder="Enter new strong password..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-mnkhan-gray-light/10 border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange px-1 py-3 outline-none text-sm"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleResetPassword}
                  className="flex-1 bg-mnkhan-charcoal text-white py-4 font-bold uppercase tracking-widest text-[10px] hover:bg-mnkhan-orange transition-all shadow-md"
                >
                  Confirm Reset
                </button>
                <button
                  onClick={() => setResetModal(null)}
                  className="flex-1 py-4 border border-mnkhan-gray-border text-mnkhan-text-muted font-bold uppercase tracking-widest text-[9px] hover:bg-mnkhan-gray-light/10 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-mnkhan-charcoal/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md p-8 rounded-sm shadow-2xl border border-mnkhan-gray-border animate-in zoom-in-95 duration-300">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center border border-red-100">
                <Trash2 className="text-red-600" size={32} />
              </div>
            </div>
            <h3 className="text-2xl font-serif italic text-mnkhan-charcoal mb-2 text-center">
              Terminate Staff Access
            </h3>
            <p className="text-xs text-mnkhan-text-muted mb-8 italic text-center">
              Are you certain you want to remove{" "}
              <span className="font-bold text-mnkhan-charcoal not-italic">
                {deleteModal.name}
              </span>{" "}
              from the firm directory? This action cannot be undone.
            </p>

            <div className="flex gap-4">
              <button
                onClick={handleDeleteStaff}
                className="flex-1 bg-red-600 text-white py-4 font-bold uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all shadow-md"
              >
                Confirm Deletion
              </button>
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 py-4 border border-mnkhan-gray-border text-mnkhan-text-muted font-bold uppercase tracking-widest text-[9px] hover:bg-mnkhan-gray-light/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStaff;
