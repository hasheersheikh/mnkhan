import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { login, signup } from '../../api/auth';

interface LoginProps {
  onClose: () => void;
  onSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isForgotPassword) {
        // Mocking the reset password call
        const response: any = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        });
        const data = await response.json();
        if (data.success) {
          setMessage(data.message);
        } else {
          setError(data.message);
        }
      } else {
        const response = isSignup 
          ? await signup(formData)
          : await login({ email: formData.email, password: formData.password, isAdmin } as any);

        const data = response.data;
        if (data.success) {
          if (isSignup) {
            setMessage(data.message);
            setFormData({ name: '', email: '', phone: '', password: '' });
            // Don't auto-login for signup anymore, wait for admin approval
          } else {
            localStorage.setItem('mnkhan_token', data.token);
            localStorage.setItem('mnkhan_user', JSON.stringify(data.user));
            navigate('/portal/overview');
            onSuccess();
          }
        } else {
          setError(data.message || 'Authentication failed');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-mnkhan-charcoal/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className={`relative bg-white w-full max-w-md p-10 rounded-sm shadow-2xl animate-in fade-in zoom-in duration-300 border-t-4 ${isAdmin ? 'border-mnkhan-orange' : 'border-transparent'}`}>
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-mnkhan-text-muted hover:text-mnkhan-charcoal transition-colors"
        >
          ✕
        </button>

        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <button 
              onClick={() => { setIsAdmin(!isAdmin); setIsSignup(false); setIsForgotPassword(false); }}
              className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${isAdmin ? 'bg-mnkhan-orange text-white border-mnkhan-orange' : 'text-mnkhan-text-muted border-mnkhan-gray-border hover:border-mnkhan-orange'}`}
            >
              {isAdmin ? 'Switch to Client Access' : 'Staff Portal Access'}
            </button>
          </div>
          <h2 className="text-3x font-serif italic mb-2">
            {isForgotPassword ? 'Reset Password' : (isAdmin ? 'Administrative Access' : (isSignup ? 'Create Account' : 'Secure Access'))}
          </h2>
          <p className="text-sm text-mnkhan-text-muted">
            {isForgotPassword ? 'Enter your email to receive recovery instructions' : (isAdmin ? 'MNKHAN Internal Compliance & Admin' : (isSignup ? 'Join the MNKHAN client ecosystem' : 'Access your professional legal portal'))}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded border border-red-100 animate-in slide-in-from-top-2">
            ⚠️ {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-50 text-green-600 text-xs font-bold rounded border border-green-100 animate-in slide-in-from-top-2">
            ✅ {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {(!isForgotPassword && isSignup) && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none transition-colors"
                  placeholder="+91 98765 43210"
                />
              </div>
            </>
          )}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Email Address</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none transition-colors"
              placeholder="client@example.com"
            />
          </div>
          {!isForgotPassword && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Password</label>
                {!isSignup && (
                  <button 
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-[10px] font-bold text-mnkhan-orange hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full border-b-2 border-mnkhan-gray-border focus:border-mnkhan-orange py-2 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-4 font-bold uppercase tracking-widest text-sm transition-all duration-300 shadow-lg disabled:opacity-50 text-white ${isAdmin ? 'bg-mnkhan-orange hover:bg-mnkhan-charcoal' : 'bg-mnkhan-charcoal hover:bg-mnkhan-orange'}`}
          >
            {loading ? 'Processing...' : (isForgotPassword ? 'Reset Password' : (isSignup ? 'Register' : 'Authenticate'))}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-mnkhan-gray-border flex flex-col gap-4">
          {!isForgotPassword ? (
            isAdmin ? (
              <p className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">
                Administrative access is restricted. Contact IT for credentials.
              </p>
            ) : (
              <button 
                onClick={() => setIsSignup(!isSignup)}
                className="text-xs font-bold text-mnkhan-orange hover:underline decoration-2 underline-offset-4"
              >
                {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
              </button>
            )
          ) : (
            <button 
              onClick={() => setIsForgotPassword(false)}
              className="text-xs font-bold text-mnkhan-orange hover:underline decoration-2 underline-offset-4"
            >
              Back to Authentication
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
