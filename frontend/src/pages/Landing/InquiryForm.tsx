import React, { useState, useEffect } from 'react';
import { getServices } from '../../api/services';
import { submitInquiry } from '../../api/inquiries';

interface Service {
  _id: string;
  name: string;
}

interface InquiryFormProps {
  initialService?: string;
  isEmbedded?: boolean;
  onSuccess?: () => void;
  theme?: 'light' | 'dark';
}

const InquiryForm: React.FC<InquiryFormProps> = ({ 
  initialService, 
  isEmbedded, 
  onSuccess,
  theme = 'dark'
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const user = JSON.parse(localStorage.getItem('mnkhan_user') || '{}');
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: '',
    service: initialService || '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    getServices()
      .then(res => {
        if (res.data.success) {
          setServices(res.data.services);
        }
      });
  }, []);

  useEffect(() => {
    if (initialService) {
      setFormData(prev => ({ ...prev, service: initialService }));
    }
  }, [initialService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const submissionData = {
        ...formData,
        phone: `+91 ${formData.phone}`
      };
      const response = await submitInquiry(submissionData);
      const data = response.data;

      if (data.success) {
        setStatus('success');
        setFormData({ name: user.name || '', email: user.email || '', phone: '', service: initialService || '', message: '' });
        if (onSuccess) onSuccess();
      } else {
        setStatus('error');
        setErrorMsg(data.message || 'Something went wrong');
      }
    } catch (err: any) {
      console.error('Inquiry error:', err);
      setStatus('error');
      setErrorMsg(err.response?.data?.message || 'Service temporarily unavailable.');
    }
  };

  const formContent = (
    <div className={`max-w-4xl mx-auto relative z-10 ${isEmbedded ? '' : 'py-24'}`}>
      {!isEmbedded && (
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif mb-4 italic">Start a Conversation</h2>
          <p className="text-white/60 text-lg">Send us an inquiry and our legal experts will get back to you.</p>
        </div>
      )}

      {status === 'success' ? (
        <div className={`backdrop-blur-md border border-mnkhan-orange p-12 text-center rounded-sm animate-in fade-in zoom-in duration-500 ${theme === 'dark' ? 'bg-white/10' : 'bg-mnkhan-orange/5'}`}>
          <div className="w-16 h-16 bg-mnkhan-orange rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl font-bold text-white">✓</span>
          </div>
          <h3 className={`text-3xl font-serif mb-4 ${theme === 'dark' ? 'text-white' : 'text-mnkhan-charcoal'}`}>Inquiry Received</h3>
          <p className={`leading-relaxed ${theme === 'dark' ? 'text-white/70' : 'text-mnkhan-text-muted'}`}>Thank you for reaching out to MN KHAN. A member of our team will contact you shortly regarding your request.</p>
          <button 
            onClick={() => setStatus('idle')}
            className="mt-8 text-mnkhan-orange font-bold uppercase tracking-widest text-xs hover:underline"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={`grid grid-cols-1 md:grid-cols-2 gap-8 backdrop-blur-xl p-10 md:p-16 border rounded-sm ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50/50 border-mnkhan-gray-border'}`}>
          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white/40' : 'text-mnkhan-text-muted'}`}>Full Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className={`w-full bg-transparent border-b py-3 outline-none transition-colors ${theme === 'dark' ? 'border-white/20 focus:border-mnkhan-orange text-white placeholder:text-white/20' : 'border-mnkhan-gray-border focus:border-mnkhan-orange text-mnkhan-charcoal placeholder:text-gray-400'}`}
              placeholder="John Martineau"
            />
          </div>
          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white/40' : 'text-mnkhan-text-muted'}`}>Email Address</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className={`w-full bg-transparent border-b py-3 outline-none transition-colors ${theme === 'dark' ? 'border-white/20 focus:border-mnkhan-orange text-white placeholder:text-white/20' : 'border-mnkhan-gray-border focus:border-mnkhan-orange text-mnkhan-charcoal placeholder:text-gray-400'}`}
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white/40' : 'text-mnkhan-text-muted'}`}>Phone Number (India)</label>
            <div className={`flex items-center gap-2 border-b focus-within:border-mnkhan-orange transition-colors ${theme === 'dark' ? 'border-white/20' : 'border-mnkhan-gray-border'}`}>
              <span className={`font-bold py-3 ${theme === 'dark' ? 'text-white' : 'text-mnkhan-charcoal'}`}>+91</span>
              <input 
                type="tel" 
                pattern="[0-9]{10}"
                required
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10)})}
                className={`w-full bg-transparent py-3 outline-none ${theme === 'dark' ? 'text-white placeholder:text-white/20' : 'text-mnkhan-charcoal placeholder:text-gray-400'}`}
                placeholder="98765-43210"
              />
            </div>
          </div>
          <div className="col-span-full space-y-2">
            <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white/40' : 'text-mnkhan-text-muted'}`}>Select Service</label>
            <select 
              required
              value={formData.service}
              onChange={e => setFormData({...formData, service: e.target.value})}
              className={`w-full border-b py-3 outline-none transition-colors appearance-none ${theme === 'dark' ? 'bg-mnkhan-charcoal/50 border-white/20 focus:border-mnkhan-orange text-white' : 'bg-white border-mnkhan-gray-border focus:border-mnkhan-orange text-mnkhan-charcoal'}`}
            >
              <option value="" disabled className={theme === 'dark' ? 'text-white/20' : 'text-gray-400'}>How can we help you?</option>
              {services.map(s => (
                <option key={s._id} value={s.name} className={theme === 'dark' ? 'bg-mnkhan-charcoal text-white' : 'bg-white text-mnkhan-charcoal'}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-full space-y-2">
            <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white/40' : 'text-mnkhan-text-muted'}`}>Your Message</label>
            <textarea 
              required
              rows={4}
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
              className={`w-full bg-transparent border p-4 outline-none transition-colors rounded-sm ${theme === 'dark' ? 'border-white/20 focus:border-mnkhan-orange text-white placeholder:text-white/20' : 'border-mnkhan-gray-border focus:border-mnkhan-orange text-mnkhan-charcoal placeholder:text-gray-400'}`}
              placeholder="Briefly describe your requirements..."
            />
          </div>

          <div className="col-span-full pt-4">
            {status === 'error' && (
              <div className="mb-6 text-mnkhan-orange text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <span>⚠</span> {errorMsg}
              </div>
            )}
            <button 
              type="submit"
              disabled={status === 'loading'}
              className={`w-full py-5 font-bold uppercase tracking-[0.2em] text-sm transition-all duration-500 disabled:opacity-50 shadow-2xl ${theme === 'dark' ? 'bg-white text-mnkhan-charcoal hover:bg-mnkhan-orange hover:text-white' : 'bg-mnkhan-charcoal text-white hover:bg-mnkhan-orange'}`}
            >
              {status === 'loading' ? 'Transmitting...' : 'Submit Inquiry'}
            </button>
          </div>
        </form>

      )}
    </div>
  );

  if (isEmbedded) return formContent;

  return (
    <section id="contact" className="px-8 bg-mnkhan-charcoal text-white relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-mnkhan-orange rounded-full blur-[160px] opacity-10 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-mnkhan-orange rounded-full blur-[120px] opacity-5 translate-y-1/2 -translate-x-1/2" />
      {formContent}
    </section>
  );
};

export default InquiryForm;
