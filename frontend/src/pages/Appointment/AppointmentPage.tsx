import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  createAppointment, 
  verifyPayment, 
  getHourlyRate, 
  getAvailability
} from '../../api/appointment';
import type { TimeSlot, AppointmentData } from '../../api/appointment';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const AppointmentPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [notes, setNotes] = useState('');
  
  // Data state
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch hourly rate on mount
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await getHourlyRate();
        setHourlyRate(response.rate.rateInRupees);
      } catch (err) {
        console.error('Error fetching hourly rate:', err);
        setError('Unable to fetch pricing. Please try again later.');
      }
    };
    fetchRate();
  }, []);

  // Fetch available slots when date changes
  useEffect(() => {
    if (!selectedDate) return;
    
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedTime('');
      try {
        const response = await getAvailability(selectedDate);
        setAvailableSlots(response.slots);
      } catch (err) {
        console.error('Error fetching availability:', err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDate]);

  // Calculate total price
  const totalPrice = hourlyRate * duration;

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Check if selected duration is available
  const isValidDuration = () => {
    if (!selectedTime || availableSlots.length === 0) return true;
    
    const selectedIndex = availableSlots.findIndex(s => s.startTime === selectedTime);
    if (selectedIndex === -1) return false;
    
    // Check if consecutive slots are available for the duration
    for (let i = 0; i < duration; i++) {
      const slot = availableSlots[selectedIndex + i];
      if (!slot || !slot.available) return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!isValidDuration()) {
      setError('Selected duration is not available for this time slot.');
      return;
    }

    setLoading(true);

    try {
      const appointmentData: AppointmentData = {
        customerName,
        customerEmail,
        customerPhone,
        date: selectedDate,
        startTime: selectedTime,
        duration,
        notes,
      };

      // Create appointment and get Razorpay order
      const response = await createAppointment(appointmentData);

      // Check for bypass
      if (response.paymentBypassed) {
        navigate('/appointment/success', {
          state: {
            appointment: response.appointment,
          },
        });
        return;
      }

      if (!response.razorpay) {
        setError('Payment initialization failed. Please try again.');
        return;
      }

      // Initialize Razorpay payment
      const options = {
        key: response.razorpay.key,
        amount: response.razorpay.amount,
        currency: response.razorpay.currency,
        name: 'MN Khan',
        description: `Appointment for ${duration} hour(s) on ${selectedDate}`,
        order_id: response.razorpay.orderId,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
          color: '#FF4612',
        },
        handler: async function (razorpayResponse: any) {
          try {
            // Verify payment on backend
            const verifyResponse = await verifyPayment({
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
              appointmentId: response.appointment.id,
            });

            // Navigate to success page
            navigate('/appointment/success', {
              state: {
                appointment: verifyResponse.appointment,
              },
            });
          } catch (err) {
            console.error('Payment verification failed:', err);
            setError('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      console.error('Error creating appointment:', err);
      setError(err.response?.data?.message || 'Failed to create appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mnkhan-gray-bg py-12 px-4 relative">
      {/* Dot Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, #333132 1px, transparent 1px)', 
          backgroundSize: '30px 30px' 
        }} 
      />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mnkhan-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-mnkhan-orange"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-mnkhan-text-muted">
              Scheduling Available
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif text-mnkhan-charcoal mb-4 tracking-tight">
            Book an <span className="text-mnkhan-orange italic">Appointment</span>
          </h1>
          <p className="text-mnkhan-text-muted text-lg max-w-xl mx-auto">
            Schedule a consultation session with an expert. Select your preferred date, time, and duration.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white border border-mnkhan-gray-border rounded-lg p-8 shadow-sm">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              {/* Personal Information */}
              <div className="mb-8">
                <h3 className="text-xl font-serif text-mnkhan-charcoal mb-4 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-mnkhan-orange text-white flex items-center justify-center mr-3 text-sm font-bold">1</span>
                  Personal Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-mnkhan-text-muted text-sm mb-2 font-bold uppercase tracking-wide">Full Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-mnkhan-gray-border text-mnkhan-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mnkhan-orange focus:border-transparent transition"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-mnkhan-text-muted text-sm mb-2 font-bold uppercase tracking-wide">Phone Number *</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-mnkhan-gray-border text-mnkhan-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mnkhan-orange focus:border-transparent transition"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-mnkhan-text-muted text-sm mb-2 font-bold uppercase tracking-wide">Email Address *</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-mnkhan-gray-border text-mnkhan-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mnkhan-orange focus:border-transparent transition"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Date & Time Selection */}
              <div className="mb-8">
                <h3 className="text-xl font-serif text-mnkhan-charcoal mb-4 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-mnkhan-orange text-white flex items-center justify-center mr-3 text-sm font-bold">2</span>
                  Select Date & Time
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-mnkhan-text-muted text-sm mb-2 font-bold uppercase tracking-wide">Date *</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={getMinDate()}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-mnkhan-gray-border text-mnkhan-charcoal focus:outline-none focus:ring-2 focus:ring-mnkhan-orange focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-mnkhan-text-muted text-sm mb-2 font-bold uppercase tracking-wide">Duration (Hours) *</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg border border-mnkhan-gray-border text-mnkhan-charcoal focus:outline-none focus:ring-2 focus:ring-mnkhan-orange focus:border-transparent transition"
                    >
                      {[1, 2, 3, 4, 5, 6].map((h) => (
                        <option key={h} value={h}>
                          {h} hour{h > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div className="mt-4">
                    <label className="block text-mnkhan-text-muted text-sm mb-2 font-bold uppercase tracking-wide">Available Time Slots *</label>
                    {loadingSlots ? (
                      <div className="text-mnkhan-text-muted py-4">Loading available slots...</div>
                    ) : availableSlots.length === 0 ? (
                      <div className="text-mnkhan-orange py-4">No slots available for this date.</div>
                    ) : (
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.startTime}
                            type="button"
                            onClick={() => setSelectedTime(slot.startTime)}
                            disabled={!slot.available}
                            className={`px-3 py-2 rounded-lg text-sm font-bold transition ${
                              selectedTime === slot.startTime
                                ? 'bg-mnkhan-orange text-white'
                                : slot.available
                                ? 'bg-white text-mnkhan-charcoal hover:border-mnkhan-orange border border-mnkhan-gray-border'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                            }`}
                          >
                            {slot.startTime}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="mb-8">
                <h3 className="text-xl font-serif text-mnkhan-charcoal mb-4 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-mnkhan-orange text-white flex items-center justify-center mr-3 text-sm font-bold">3</span>
                  Additional Notes
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-mnkhan-gray-border text-mnkhan-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mnkhan-orange focus:border-transparent transition resize-none"
                  placeholder="Describe what you'd like to discuss (optional)"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !selectedTime || !customerName || !customerEmail || !customerPhone}
                className="w-full py-4 px-6 rounded-lg bg-mnkhan-charcoal hover:bg-mnkhan-orange text-white font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Proceed to Pay ₹${totalPrice.toLocaleString()}`
                )}
              </button>
            </form>
          </div>

          {/* Price Summary Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white border border-mnkhan-gray-border rounded-lg p-6 shadow-sm sticky top-8">
              <h3 className="text-xl font-serif text-mnkhan-charcoal mb-6 border-b-2 border-mnkhan-orange pb-2 inline-block">Booking Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-mnkhan-text-muted">
                  <span>Hourly Rate</span>
                  <span className="font-bold text-mnkhan-charcoal">₹{hourlyRate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-mnkhan-text-muted">
                  <span>Duration</span>
                  <span className="font-bold text-mnkhan-charcoal">{duration} hour{duration > 1 ? 's' : ''}</span>
                </div>

                {selectedDate && (
                  <div className="flex justify-between text-mnkhan-text-muted">
                    <span>Date</span>
                    <span className="font-bold text-mnkhan-charcoal">
                      {new Date(selectedDate).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}

                {selectedTime && (
                  <div className="flex justify-between text-mnkhan-text-muted">
                    <span>Time</span>
                    <span className="font-bold text-mnkhan-charcoal">{selectedTime}</span>
                  </div>
                )}
                
                <hr className="border-mnkhan-gray-border" />
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-mnkhan-text-muted font-bold uppercase text-xs tracking-wide">Total Amount</span>
                  <span className="text-3xl font-bold text-mnkhan-orange">
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-mnkhan-charcoal rounded-lg">
                <p className="text-white text-sm">
                  <span className="text-mnkhan-orange">✓</span> Secure payment via Razorpay<br />
                  <span className="text-mnkhan-orange">✓</span> Google Meet link included<br />
                  <span className="text-mnkhan-orange">✓</span> Calendar invite sent automatically
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentPage;
