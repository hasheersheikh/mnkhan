import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { resetPasswordConfirmed } from '../../api/auth';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const response = await resetPasswordConfirmed(token!, password);

      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message });
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mnkhan-gray-bg px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Reset Link</h1>
          <p className="text-mnkhan-text-muted mb-6">This password reset link is invalid or has expired.</p>
          <button onClick={() => navigate('/login')} className="text-mnkhan-orange font-bold hover:underline">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mnkhan-gray-bg px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 border border-mnkhan-gray-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
          <p className="text-mnkhan-text-muted">Enter your new secure password below.</p>
        </div>

        {message.text && (
          <div className={`p-4 rounded mb-6 text-sm font-medium ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-mnkhan-charcoal mb-2">New Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded border border-mnkhan-gray-border focus:outline-none focus:border-mnkhan-orange transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-mnkhan-charcoal mb-2">Confirm Password</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded border border-mnkhan-gray-border focus:outline-none focus:border-mnkhan-orange transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 bg-mnkhan-charcoal text-white rounded font-bold uppercase tracking-widest transition-all duration-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-mnkhan-orange hover:shadow-lg hover:shadow-mnkhan-orange/20'
            }`}
          >
            {loading ? 'Updating...' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
