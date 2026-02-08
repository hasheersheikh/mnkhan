import React, { useEffect, useState } from 'react';
import { getUsers, updateUserStatus, resetClientPassword } from '../../api/admin';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'active' | 'deactivated';
  createdAt: string;
}

const ManageClients: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      const res = await updateUserStatus(id, newStatus);
      if (res.data.success) {
        setUsers(users.map(u => u._id === id ? { ...u, status: newStatus as any } : u));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setUpdating(null);
    }
  };

  const handleResetPassword = async (id: string) => {
    const newPassword = prompt('Enter new password for this client:');
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    if (!confirm('Are you sure you want to force reset this client\'s password?')) return;

    try {
      const res = await resetClientPassword(id, newPassword);
      if (res.data.success) {
        alert('Password reset successfully');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Active</span>;
      case 'pending':
        return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Pending Approval</span>;
      case 'deactivated':
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Deactivated</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-mnkhan-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-serif italic mb-2">Client Ecosystem</h1>
          <p className="text-sm text-mnkhan-text-muted">Manage client access, approvals, and security status.</p>
        </div>
      </div>

      <div className="bg-white border border-mnkhan-gray-border overflow-hidden rounded-sm shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-mnkhan-charcoal text-white">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em]">Client Information</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em]">Contact</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em]">Joined On</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mnkhan-gray-border">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-mnkhan-text-muted italic">
                  No clients found in the ecosystem.
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-bold text-mnkhan-charcoal">{user.name}</div>
                    <div className="text-xs text-mnkhan-text-muted">{user.email}</div>
                  </td>
                  <td className="px-6 py-5 text-sm text-mnkhan-charcoal">
                    {user.phone}
                  </td>
                  <td className="px-6 py-5 text-xs text-mnkhan-text-muted">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-5">
                    {statusBadge(user.status)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      {user.status === 'pending' && (
                        <button
                          disabled={!!updating}
                          onClick={() => handleStatusUpdate(user._id, 'active')}
                          className="bg-green-600 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {updating === user._id ? '...' : 'Approve'}
                        </button>
                      )}
                      {user.status === 'active' && (
                        <button
                          disabled={!!updating}
                          onClick={() => handleStatusUpdate(user._id, 'deactivated')}
                          className="border border-red-600 text-red-600 px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {updating === user._id ? '...' : 'Deactivate'}
                        </button>
                      )}
                      {user.status === 'deactivated' && (
                        <button
                          disabled={!!updating}
                          onClick={() => handleStatusUpdate(user._id, 'active')}
                          className="border border-green-600 text-green-600 px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-green-50 transition-colors disabled:opacity-50"
                        >
                          {updating === user._id ? '...' : 'Reactivate'}
                        </button>
                      )}
                      <button
                        onClick={() => handleResetPassword(user._id)}
                        className="border border-mnkhan-charcoal text-mnkhan-charcoal px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-mnkhan-charcoal hover:text-white transition-colors"
                      >
                        Reset PWD
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageClients;
