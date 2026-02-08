import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getCart, removeFromCart, checkoutCart, verifyCartPayment } from '../../api/cart';
import { validateVoucher } from '../../api/vouchers';
import { Ticket, CheckCircle, XCircle } from 'lucide-react';

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherData, setVoucherData] = useState<any>(null);
  const [voucherError, setVoucherError] = useState('');
  const navigate = useNavigate();

  const userRole = JSON.parse(localStorage.getItem('mnkhan_user') || '{}').role;
  const isInternal = ['admin', 'super-admin', 'staff'].includes(userRole);
  const isStaff = userRole === 'staff';

  const fetchCart = async () => {
    try {
      const res = await getCart();
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (serviceId: string) => {
    try {
      const res = await removeFromCart(serviceId);
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode) return;
    setVoucherError('');
    try {
      const res = await validateVoucher(voucherCode);
      if (res.data.success) {
        setVoucherData(res.data.voucher);
      }
    } catch (err: any) {
      setVoucherError(err.response?.data?.message || 'Invalid voucher code');
      setVoucherData(null);
    }
  };

  const handleCheckout = async () => {
    setProcessing(true);
    try {
      const res = await checkoutCart(voucherData?.code);
      if (res.data.success) {
        const { orderId, amount, currency, key } = res.data;

        const options = {
          key,
          amount,
          currency,
          name: 'MN Khan & Associates',
          description: `Payment for ${cart.items.length} services`,
          order_id: orderId,
          handler: async (response: any) => {
            try {
              const verifyRes = await verifyCartPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.data.success) {
                alert('Payment successful! Your services have been added to your tasks.');
                navigate('/portal/overview');
              }
            } catch (err) {
              alert('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: JSON.parse(localStorage.getItem('mnkhan_user') || '{}').name,
            email: JSON.parse(localStorage.getItem('mnkhan_user') || '{}').email,
          },
          theme: {
            color: '#333132',
          },
        };

        if (typeof (window as any).Razorpay === 'undefined') {
          alert('Razorpay payment gateway is not loaded. Please refresh the page or disable ad-blockers.');
          setProcessing(false);
          return;
        }

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <div className="w-8 h-8 border-2 border-mnkhan-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const total = cart?.items.reduce((sum: number, item: any) => {
    const priceStr = (item.price || "0").toString().replace(/[^0-9.]/g, "");
    const price = Number(priceStr) || 0;
    return sum + price;
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12 border-b border-mnkhan-gray-border pb-8">
          <h1 className="text-6xl font-serif italic mb-4 text-mnkhan-charcoal">Your Portfolio.</h1>
          <p className="text-[10px] text-mnkhan-text-muted uppercase tracking-[0.4em] font-bold">Consolidated Service Management & Procurement</p>
        </div>

        {!cart || cart.items.length === 0 ? (
          <div className="bg-white border border-mnkhan-gray-border p-24 text-center rounded-sm">
            <p className="text-mnkhan-text-muted italic mb-10 text-xl font-serif">Your portfolio is currently waiting for selections.</p>
            <button 
              onClick={() => navigate('/services')}
              className="px-12 py-5 bg-mnkhan-charcoal text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-mnkhan-orange transition-all duration-500 shadow-xl shadow-black/10"
            >
              Explore Services
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            <div className="space-y-4">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-mnkhan-text-muted mb-8 border-b border-mnkhan-gray-border pb-4">Selected Engagements ({cart.items.length})</h2>
              <div className="divide-y divide-mnkhan-gray-border">
                {cart.items.map((item: any) => (
                  <div key={item._id} className="py-10 first:pt-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                         <span className="w-8 h-[1px] bg-mnkhan-orange group-hover:w-12 transition-all duration-500" />
                         <h3 className="text-2xl font-bold text-mnkhan-charcoal uppercase tracking-tight">{item.name}</h3>
                      </div>
                      <p className="text-sm text-mnkhan-text-muted leading-relaxed max-w-3xl mb-4 italic">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-6 md:gap-2 min-w-fit">
                      {!isStaff && (
                        <p className="text-xl font-bold text-mnkhan-charcoal font-serif">
                          ₹{(Number((item.price || "0").toString().replace(/[^0-9.]/g, "")) || 0).toLocaleString('en-IN')}
                        </p>
                      )}
                      <button 
                        onClick={() => handleRemove(item._id)}
                        className="text-[10px] font-bold text-red-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-mnkhan-charcoal text-white p-12 md:p-16 rounded-sm shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-mnkhan-orange opacity-5 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-mnkhan-orange opacity-[0.03] blur-[80px] translate-y-1/2 -translate-x-1/3 rounded-full pointer-events-none" />
              
              <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
                <div className="max-w-xl">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-mnkhan-orange mb-6">Consolidated Procurement Summary</h2>
                  <p className="text-3xl md:text-4xl font-serif italic text-white/90 leading-tight">
                    Authorizing legal services for your portfolio.
                  </p>
                  <p className="mt-6 text-sm text-white/40 leading-relaxed max-w-md">
                    By proceeding, you acknowledge the selection of {cart.items.length} professional 
                    engagements. Our teams will instantiate your workflow upon successful authorization.
                  </p>
                </div>

                <div className="w-full lg:w-auto min-w-[320px] lg:border-l lg:border-white/10 lg:pl-16">
                  {/* Voucher Section */}
                  <div className="mb-10 pb-10 border-b border-white/10">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-4">Promotional Voucher</h4>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Ticket size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                        <input 
                          type="text" 
                          placeholder="Enter Code"
                          value={voucherCode}
                          onChange={(e) => { setVoucherCode(e.target.value.toUpperCase()); setVoucherError(''); }}
                          className="w-full bg-white/5 border border-white/10 rounded-sm py-3 pl-10 pr-4 text-xs font-mono tracking-widest uppercase focus:outline-none focus:border-mnkhan-orange transition-colors"
                        />
                      </div>
                      <button 
                        onClick={handleApplyVoucher}
                        className="px-6 py-3 bg-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-mnkhan-orange transition-all rounded-sm"
                      >
                        Apply
                      </button>
                    </div>
                    {voucherError && <p className="text-[10px] text-red-400 mt-2 font-bold uppercase tracking-widest flex items-center gap-1"><XCircle size={10} /> {voucherError}</p>}
                    {voucherData && <p className="text-[10px] text-green-400 mt-2 font-bold uppercase tracking-widest flex items-center gap-1"><CheckCircle size={10} /> {voucherData.code} Applied: {voucherData.discountType === 'percentage' ? `${voucherData.discountValue}% Off` : `₹${voucherData.discountValue} Off`}</p>}
                  </div>

                  <div className="flex justify-between items-end mb-10">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Total Professional Fee</span>
                      {voucherData && (
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xl text-white/30 line-through">₹{total.toLocaleString('en-IN')}</span>
                          <span className="px-2 py-0.5 bg-mnkhan-orange/20 text-mnkhan-orange text-[9px] font-bold uppercase tracking-widest rounded-full">
                            -{voucherData.discountType === 'percentage' ? `${voucherData.discountValue}%` : `₹${voucherData.discountValue}`}
                          </span>
                        </div>
                      )}
                      {!isStaff && (
                        <span className="text-5xl md:text-6xl font-bold font-serif italic text-mnkhan-orange">
                          ₹{(voucherData 
                            ? Math.max(0, total - (voucherData.discountType === 'percentage' ? (total * voucherData.discountValue / 100) : voucherData.discountValue))
                            : total
                          ).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {!isInternal && (
                    <button
                      disabled={processing}
                      onClick={handleCheckout}
                      className="w-full py-7 bg-mnkhan-orange text-white text-[12px] font-bold uppercase tracking-[0.5em] hover:bg-white hover:text-mnkhan-charcoal transition-all duration-700 disabled:opacity-50 shadow-2xl shadow-mnkhan-orange/20"
                    >
                      {processing ? 'Processing...' : 'Authorize & Procure'}
                    </button>
                  )}

                  <div className="mt-8 flex justify-center lg:justify-start gap-8 border-t border-white/5 pt-8">
                    <div className="text-center lg:text-left">
                      <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">Payment Secure</p>
                      <p className="text-[10px] font-bold text-white/60">Razorpay Gateway</p>
                    </div>
                    <div className="text-center lg:text-left">
                      <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">Service Activation</p>
                      <p className="text-[10px] font-bold text-white/60">Instant Workflow</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
               <div className="p-8 border border-mnkhan-gray-border bg-[#FAFAFA] rounded-sm transform transition-all duration-500 hover:shadow-lg">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal mb-4">Post-Procurement Workflow</h4>
                  <p className="text-xs text-mnkhan-text-muted leading-relaxed">
                    Upon successful authorization, these services will be immediately instantiated as active tasks in your 
                    <span className="text-mnkhan-orange font-bold"> Edge Portal</span>. 
                  </p>
               </div>
               <div className="p-8 border border-mnkhan-gray-border bg-[#FAFAFA] rounded-sm transform transition-all duration-500 hover:shadow-lg">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal mb-4">Document Verification</h4>
                  <p className="text-xs text-mnkhan-text-muted leading-relaxed">
                    Our legal associates will begin the verification process of your documents within 24 hours of procurement.
                  </p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
