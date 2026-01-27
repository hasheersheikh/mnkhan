import React, { useState } from 'react';

const ResetPasswordForm: React.FC = () => {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const user = JSON.parse(localStorage.getItem('mnkhan_user') || '{}');
      const response = await fetch('http://localhost:5001/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('mnkhan_token')}`
        },
        body: JSON.stringify({
          email: user.email,
          newPassword: passwords.new
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ text: 'Password updated successfully', type: 'success' });
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        setMessage({ text: data.message, type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Failed to update password. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-12 rounded-sm shadow-xl border border-mnkhan-gray-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-mnkhan-orange rounded-full blur-[120px] opacity-10 -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <h2 className="text-3xl font-serif italic mb-2 text-mnkhan-charcoal">Account Security</h2>
          <p className="text-sm text-mnkhan-text-muted mb-10 uppercase tracking-widest font-bold">Update your access credentials</p>

          {message.text && (
            <div className={`mb-8 p-4 rounded text-xs font-bold border animate-in slide-in-from-top-2 ${
              message.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
            }`}>
              {message.type === 'success' ? '✅' : '⚠️'} {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Current Password</label>
              <input 
                type="password"
                required
                value={passwords.current}
                onChange={e => setPasswords({...passwords, current: e.target.value})}
                className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">New Password</label>
                <input 
                  type="password"
                  required
                  value={passwords.new}
                  onChange={e => setPasswords({...passwords, new: e.target.value})}
                  className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Confirm New Password</label>
                <input 
                  type="password"
                  required
                  value={passwords.confirm}
                  onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                  className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-mnkhan-charcoal text-white py-4 font-bold uppercase tracking-widest text-sm hover:bg-mnkhan-orange transition-all duration-300 shadow-lg disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
      
      <div className="mt-12 p-8 bg-mnkhan-charcoal text-white/50 text-xs rounded-sm border border-white/5">
        <p className="font-bold text-white mb-2 tracking-widest uppercase">Security Policy</p>
        <p className="leading-relaxed">
          Passwords must be at least 8 characters long and include a mix of uppercase letters, numbers, and special characters. 
          For your safety, we recommend updating your password every 90 days.
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
