import React from 'react';
import { useLocation, Link } from 'react-router';

interface AppointmentDetails {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  googleMeetLink?: string;
}

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const appointment = location.state?.appointment as AppointmentDetails | undefined;

  // Redirect if no appointment data
  if (!appointment) {
    return (
      <div className="min-h-screen bg-mnkhan-gray-bg flex items-center justify-center px-4">
        <div className="bg-white border border-mnkhan-gray-border rounded-lg p-8 shadow-sm text-center max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-serif text-mnkhan-charcoal mb-4">No Appointment Found</h2>
          <p className="text-mnkhan-text-muted mb-6">
            We couldn't find your appointment details. Please check your email for confirmation.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 rounded-lg bg-mnkhan-charcoal hover:bg-mnkhan-orange text-white font-bold transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(appointment.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-mnkhan-gray-bg flex items-center justify-center px-4 py-12 relative">
      {/* Dot Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, #333132 1px, transparent 1px)', 
          backgroundSize: '30px 30px' 
        }} 
      />

      <div className="max-w-2xl w-full relative z-10">
        {/* Success Card */}
        <div className="bg-white border border-mnkhan-gray-border rounded-lg p-8 shadow-sm text-center">
          {/* Animated Check */}
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-mnkhan-orange flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl font-serif text-mnkhan-charcoal mb-4">
            Payment <span className="text-mnkhan-orange italic">Successful!</span>
          </h1>
          <p className="text-mnkhan-text-muted text-lg mb-8">
            Your appointment has been confirmed. Check your email for details.
          </p>

          {/* Appointment Details */}
          <div className="bg-mnkhan-gray-bg rounded-lg p-6 mb-8 text-left border border-mnkhan-gray-border">
            <h3 className="text-lg font-serif text-mnkhan-charcoal mb-4 text-center border-b-2 border-mnkhan-orange pb-2 inline-block w-full">Appointment Details</h3>
            
            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-center py-2 border-b border-mnkhan-gray-border">
                <span className="text-mnkhan-text-muted">📅 Date</span>
                <span className="text-mnkhan-charcoal font-bold">{formattedDate}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-mnkhan-gray-border">
                <span className="text-mnkhan-text-muted">🕐 Time</span>
                <span className="text-mnkhan-charcoal font-bold">{appointment.startTime} - {appointment.endTime}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-mnkhan-gray-border">
                <span className="text-mnkhan-text-muted">⏱️ Duration</span>
                <span className="text-mnkhan-charcoal font-bold">{appointment.duration} hour{appointment.duration > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-mnkhan-text-muted">✓ Status</span>
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold">
                  Confirmed
                </span>
              </div>
            </div>
          </div>

          {/* Google Meet Link */}
          {appointment.googleMeetLink && (
            <div className="bg-mnkhan-charcoal rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-mnkhan-orange mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span className="text-lg font-bold text-white">Google Meet Link</span>
              </div>
              <a
                href={appointment.googleMeetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full py-3 px-6 rounded-lg bg-mnkhan-orange hover:bg-mnkhan-orange-hover text-white font-bold transition"
              >
                Join Meeting
              </a>
              <p className="text-gray-400 text-sm mt-3">
                This link is also included in your confirmation email
              </p>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-amber-50 rounded-lg p-4 mb-8 border border-amber-200">
            <h4 className="text-amber-700 font-bold mb-2">📧 What's Next?</h4>
            <p className="text-amber-800 text-sm">
              A confirmation email with calendar invite has been sent to your email address.
              Add it to your calendar to receive reminders.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/"
              className="flex-1 py-3 px-6 rounded-lg border-2 border-mnkhan-charcoal text-mnkhan-charcoal hover:bg-mnkhan-charcoal hover:text-white font-bold transition text-center"
            >
              Go Home
            </Link>
            <Link
              to="/appointment"
              className="flex-1 py-3 px-6 rounded-lg bg-mnkhan-charcoal hover:bg-mnkhan-orange text-white font-bold transition text-center"
            >
              Book Another
            </Link>
          </div>
        </div>

        {/* Support Info */}
        <p className="text-center text-mnkhan-text-muted text-sm mt-6">
          Need help? Contact us at{' '}
          <a href="mailto:support@mnkhan.com" className="text-mnkhan-orange hover:underline font-bold">
            support@mnkhan.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
