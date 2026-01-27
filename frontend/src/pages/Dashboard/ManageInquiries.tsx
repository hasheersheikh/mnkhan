import React, { useEffect, useState } from 'react';
import * as inquiriesApi from '../../api/inquiries';

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: string;
  createdAt: string;
}

const ManageInquiries: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await inquiriesApi.getInquiries();
      if (res.data.success) {
        setInquiries(res.data.inquiries);
      } else {
        setError(res.data.message || 'Failed to fetch inquiries');
      }
    } catch (err: any) {
      console.error('Fetch inquiries error:', err);
      setError(err.response?.data?.message || 'Failed to load inquiries.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await inquiriesApi.updateInquiry(id, { status: newStatus });
      if (res.data.success) {
        setInquiries(prev => prev.map(inq => inq._id === id ? { ...inq, status: newStatus } : inq));
      }
    } catch (err) {
      console.error('Update inquiry status error:', err);
      alert('Failed to update status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      const res = await inquiriesApi.deleteInquiry(id);
      if (res.data.success) {
        setInquiries(prev => prev.filter(inq => inq._id !== id));
      }
    } catch (err) {
      console.error('Delete inquiry error:', err);
      alert('Failed to delete inquiry.');
    }
  };

  if (loading) return <div className="p-8 text-center text-mnkhan-text-muted">Loading inquiries...</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-mnkhan-charcoal">Client Inquiries</h1>
          <p className="text-mnkhan-text-muted mt-1">Manage and respond to incoming requests.</p>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-sm border border-red-100">{error}</div>}

      <div className="bg-white border border-mnkhan-gray-border rounded-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#FAFAFA] border-b border-mnkhan-gray-border">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal">Client</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal">Service</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mnkhan-gray-border">
              {inquiries.length > 0 ? inquiries.map((inq) => (
                <tr key={inq._id} className="hover:bg-[#FCFCFC] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-mnkhan-charcoal">{inq.name}</div>
                    <div className="text-xs text-mnkhan-text-muted">{inq.email}</div>
                    <div className="text-xs text-mnkhan-text-muted">{inq.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{inq.service}</div>
                    <div className="text-xs text-mnkhan-text-muted max-w-[200px] truncate" title={inq.message}>{inq.message}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={inq.status}
                      onChange={(e) => handleStatusUpdate(inq._id, e.target.value)}
                      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded outline-none border transition-colors ${
                        inq.status === 'done' ? 'bg-green-50 text-green-700 border-green-200' :
                        inq.status === 'responded' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-mnkhan-orange/10 text-mnkhan-orange border-mnkhan-orange/20'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="responded">Responded</option>
                      <option value="done">Done</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-xs text-mnkhan-text-muted">
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(inq._id)}
                      className="text-xs font-bold text-red-500 uppercase tracking-widest hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center italic text-mnkhan-text-muted">
                    No inquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageInquiries;
