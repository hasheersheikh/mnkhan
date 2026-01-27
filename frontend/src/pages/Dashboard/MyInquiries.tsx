import React, { useEffect, useState } from 'react';
import { getMyInquiries } from '../../api/inquiries';
import InquiryForm from '../Landing/InquiryForm';

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

const MyInquiries: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchInquiries = () => {
    setLoading(true);
    getMyInquiries()
      .then(res => {
        if (res.data.success) {
          setInquiries(res.data.inquiries);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch inquiries:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done': return 'bg-green-100 text-green-700 border-green-200';
      case 'responded': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-mnkhan-orange/10 text-mnkhan-orange border-mnkhan-orange/20';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-serif italic text-mnkhan-charcoal mb-2">My Inquiries</h1>
          <p className="text-mnkhan-text-muted">Track your service requests and legal consultations.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-mnkhan-charcoal text-white px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-mnkhan-orange transition-all"
        >
          New Inquiry
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-50 animate-pulse border border-mnkhan-gray-border" />)}
        </div>
      ) : inquiries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {inquiries.map((inquiry) => (
            <div key={inquiry._id} className="bg-white border border-mnkhan-gray-border p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(inquiry.status)}`}>
                  {inquiry.status}
                </span>
                <span className="text-[10px] text-mnkhan-text-muted font-bold uppercase tracking-widest">
                  {new Date(inquiry.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-lg font-bold text-mnkhan-charcoal mb-2">{inquiry.service}</h3>
              <p className="text-mnkhan-text-muted text-sm leading-relaxed mb-6 flex-grow italic">
                "{inquiry.message.length > 120 ? inquiry.message.substring(0, 120) + '...' : inquiry.message}"
              </p>
              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-mnkhan-text-muted uppercase tracking-widest">{inquiry.phone}</span>
                <button className="text-[10px] font-bold text-mnkhan-orange uppercase tracking-widest hover:underline">
                  View Full Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 border-2 border-dashed border-mnkhan-gray-border rounded-lg">
          <p className="text-mnkhan-text-muted italic mb-8">You haven't submitted any inquiries yet.</p>
          <button 
            onClick={() => setShowForm(true)}
            className="text-mnkhan-orange font-bold uppercase tracking-widest text-sm hover:underline"
          >
            Submit your first inquiry →
          </button>
        </div>
      )}

      {/* New Inquiry Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-mnkhan-charcoal/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl p-1 relative rounded-sm shadow-2xl overflow-hidden border border-mnkhan-gray-border">
            <button 
              onClick={() => setShowForm(false)}
              className="absolute top-8 right-8 text-mnkhan-charcoal/50 hover:text-mnkhan-charcoal z-[210] text-2xl"
            >
              ✕
            </button>
            <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="p-8 md:p-12">
                <InquiryForm 
                  theme="light"
                  isEmbedded={true} 
                  onSuccess={() => {
                    setShowForm(false);
                    fetchInquiries();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyInquiries;
