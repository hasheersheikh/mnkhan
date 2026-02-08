import React, { useState, useEffect } from 'react';
import { getVouchers, createVoucher, updateVoucher, deleteVoucher } from '../../api/vouchers';
import { Plus, Trash2, Tag, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface Voucher {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate?: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
}

const ManageVouchers: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Partial<Voucher> | null>(null);
  const [error, setError] = useState('');

  const fetchVouchers = async () => {
    try {
      const response = await getVouchers();
      setVouchers(response.data.vouchers);
    } catch (err: any) {
      setError('Failed to fetch vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVoucher) return;

    try {
      if (editingVoucher._id) {
        await updateVoucher(editingVoucher._id, editingVoucher);
      } else {
        await createVoucher(editingVoucher);
      }
      fetchVouchers();
      setShowAddModal(false);
      setEditingVoucher(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this voucher?')) return;
    try {
      await deleteVoucher(id);
      fetchVouchers();
    } catch (err: any) {
      setError('Delete failed');
    }
  };

  const toggleStatus = async (voucher: Voucher) => {
    try {
      await updateVoucher(voucher._id, { isActive: !voucher.isActive });
      fetchVouchers();
    } catch (err: any) {
      setError('Status update failed');
    }
  };

  if (loading) return <div className="p-8">Loading vouchers...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-mnkhan-charcoal flex items-center gap-3">
            <Tag className="text-mnkhan-orange" />
            Voucher Management
          </h1>
          <p className="text-mnkhan-text-muted mt-2">Create and monitor discount campaigns.</p>
        </div>
        <button 
          onClick={() => { setEditingVoucher({ discountType: 'percentage', isActive: true }); setShowAddModal(true); }}
          className="flex items-center gap-2 bg-mnkhan-charcoal text-white px-6 py-3 rounded-lg font-bold hover:bg-mnkhan-orange transition-all duration-300 shadow-xl shadow-mnkhan-charcoal/10"
        >
          <Plus size={18} />
          Create New Voucher
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-100">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vouchers.map((voucher) => (
          <div key={voucher._id} className="bg-white rounded-xl shadow-md border border-mnkhan-gray-border p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="px-3 py-1 bg-mnkhan-gray-bg rounded font-mono text-mnkhan-charcoal font-bold tracking-widest uppercase">
                {voucher.code}
              </div>
              <button onClick={() => toggleStatus(voucher)}>
                {voucher.isActive ? (
                  <CheckCircle className="text-green-500 fill-green-50" size={24} />
                ) : (
                  <XCircle className="text-red-400 fill-red-50" size={24} />
                )}
              </button>
            </div>

            <div className="mb-6">
              <div className="text-2xl font-black text-mnkhan-charcoal">
                {voucher.discountType === 'percentage' ? `${voucher.discountValue}% OFF` : `₹${voucher.discountValue} OFF`}
              </div>
              <div className="text-xs text-mnkhan-text-muted font-bold uppercase tracking-wider mt-1">Discount Value</div>
            </div>

            <div className="space-y-3 border-t border-mnkhan-gray-border pt-4 text-sm">
              <div className="flex items-center gap-2 text-mnkhan-charcoal">
                <Calendar size={16} className="text-mnkhan-text-muted" />
                <span>Expires: {voucher.expiryDate ? new Date(voucher.expiryDate).toLocaleDateString() : 'Never'}</span>
              </div>
              <div className="flex items-center gap-2 text-mnkhan-charcoal">
                <Tag size={16} className="text-mnkhan-text-muted" />
                <span>Usage: <span className="font-bold">{voucher.usageCount}</span> / {voucher.usageLimit || '∞'}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-6 pt-6 border-t border-mnkhan-gray-border">
              <button 
                onClick={() => { setEditingVoucher(voucher); setShowAddModal(true); }}
                className="flex-1 py-3 text-sm font-bold bg-mnkhan-gray-bg text-mnkhan-charcoal rounded hover:bg-mnkhan-charcoal hover:text-white transition-colors"
              >
                Edit Details
              </button>
              <button 
                onClick={() => handleDelete(voucher._id)}
                className="p-3 text-red-500 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-mnkhan-charcoal/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-bold mb-6">{editingVoucher?._id ? 'Edit Voucher' : 'New Voucher'}</h2>
            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-mnkhan-charcoal mb-2">Voucher Code</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-mnkhan-gray-border rounded focus:border-mnkhan-orange focus:outline-none uppercase font-mono tracking-widest"
                  placeholder="EX: WELCOME10"
                  required
                  value={editingVoucher?.code || ''}
                  onChange={(e) => setEditingVoucher({ ...editingVoucher, code: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-mnkhan-charcoal mb-2">Type</label>
                  <select 
                    className="w-full p-3 border border-mnkhan-gray-border rounded focus:border-mnkhan-orange focus:outline-none"
                    value={editingVoucher?.discountType}
                    onChange={(e) => setEditingVoucher({ ...editingVoucher, discountType: e.target.value as any })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-mnkhan-charcoal mb-2">Value</label>
                  <input 
                    type="number" 
                    className="w-full p-3 border border-mnkhan-gray-border rounded focus:border-mnkhan-orange focus:outline-none"
                    required
                    value={editingVoucher?.discountValue || ''}
                    onChange={(e) => setEditingVoucher({ ...editingVoucher, discountValue: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-mnkhan-charcoal mb-2">Expiry Date (Optional)</label>
                <input 
                  type="date" 
                  className="w-full p-3 border border-mnkhan-gray-border rounded focus:border-mnkhan-orange focus:outline-none"
                  value={editingVoucher?.expiryDate ? new Date(editingVoucher.expiryDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditingVoucher({ ...editingVoucher, expiryDate: e.target.value })}
                />
              </div>
              <div className="flex gap-4 mt-8">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 text-sm font-bold bg-mnkhan-gray-bg text-mnkhan-charcoal rounded hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 text-sm font-bold bg-mnkhan-orange text-white rounded hover:bg-mnkhan-charcoal transition-all shadow-lg shadow-mnkhan-orange/10"
                >
                  {editingVoucher?._id ? 'Save Changes' : 'Create Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageVouchers;
