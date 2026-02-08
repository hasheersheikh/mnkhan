import React, { useState, useEffect } from 'react';
import * as adminApi from '../../api/admin';
import { 
  X, 
  Users, 
  Check, 
  Search,
  UserPlus
} from 'lucide-react';

interface StaffAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (staffId: string) => Promise<void>;
  currentStaffId?: string;
}

const StaffAssignmentModal: React.FC<StaffAssignmentModalProps> = ({ 
  isOpen, 
  onClose, 
  onAssign, 
  currentStaffId 
}) => {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<string | undefined>(currentStaffId);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStaff();
      setSelectedStaffId(currentStaffId);
    }
  }, [isOpen, currentStaffId]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getStaff();
      if (res.data.success) {
        setStaffList(res.data.staff);
      }
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedStaffId) return;
    try {
      setProcessing(true);
      await onAssign(selectedStaffId);
      onClose();
    } catch (err) {
      console.error('Assignment failed:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-mnkhan-charcoal/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-sm shadow-2xl border border-mnkhan-gray-border flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-mnkhan-gray-border flex justify-between items-center">
          <div>
            <h3 className="text-xl font-serif italic text-mnkhan-charcoal">Assign Matter</h3>
            <p className="text-[10px] text-mnkhan-text-muted uppercase tracking-widest font-bold">Delegate to Legal Team Member</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-mnkhan-gray-light rounded-sm transition-colors text-mnkhan-text-muted">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-mnkhan-gray-light/5 border-b border-mnkhan-gray-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mnkhan-text-muted" size={14} />
            <input 
              type="text"
              placeholder="Search firm members..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-mnkhan-gray-border focus:border-mnkhan-orange outline-none transition-colors rounded-sm"
            />
          </div>
        </div>

        {/* Staff List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {loading ? (
            <div className="p-12 text-center opacity-40">
              <div className="w-8 h-8 border-2 border-mnkhan-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[10px] font-bold uppercase tracking-widest italic">Syncing Directory...</p>
            </div>
          ) : filteredStaff.length > 0 ? (
            <div className="grid grid-cols-1 gap-1">
              {filteredStaff.map((s) => (
                <button
                  key={s._id}
                  onClick={() => setSelectedStaffId(s._id)}
                  className={`flex items-center justify-between p-4 rounded-sm transition-all group ${
                    selectedStaffId === s._id 
                      ? 'bg-mnkhan-charcoal text-white shadow-lg' 
                      : 'hover:bg-mnkhan-gray-light/20 text-mnkhan-charcoal'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-sm flex items-center justify-center text-[10px] font-bold border transition-colors ${
                      selectedStaffId === s._id ? 'bg-white/10 border-mnkhan-orange text-white' : 'bg-mnkhan-charcoal text-white border-transparent'
                    }`}>
                      {s.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold">{s.name}</p>
                      <p className={`text-[10px] opacity-60 ${selectedStaffId === s._id ? 'text-white' : 'text-mnkhan-text-muted'}`}>
                        {s.email}
                      </p>
                    </div>
                  </div>
                  {selectedStaffId === s._id && <Check size={16} className="text-mnkhan-orange" />}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center opacity-20">
              <Users size={48} className="mx-auto mb-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No Members Found</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-mnkhan-gray-border flex gap-3">
          <button 
            disabled={!selectedStaffId || processing}
            onClick={handleConfirm}
            className="flex-1 bg-mnkhan-charcoal text-white py-4 font-bold uppercase tracking-widest text-[10px] hover:bg-mnkhan-orange transition-all shadow-md disabled:opacity-30 flex items-center justify-center gap-2"
          >
            {processing ? 'Assigning...' : <><UserPlus size={14} /> Confirm Assignment</>}
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-4 border border-mnkhan-gray-border text-mnkhan-text-muted font-bold uppercase tracking-widest text-[9px] hover:bg-mnkhan-gray-light/10 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffAssignmentModal;
