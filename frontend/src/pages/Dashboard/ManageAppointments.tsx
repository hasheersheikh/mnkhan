import React, { useState, useEffect, useMemo } from 'react';
import { 
  getHourlyRate, 
  updateHourlyRate, 
  getAppointments,
  rescheduleAppointment 
} from '../../api/appointment';

interface Appointment {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  googleMeetLink?: string;
  createdAt: string;
}

const ManageAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentRate, setCurrentRate] = useState<number>(0);
  const [newRate, setNewRate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'list' | 'rate'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Rescheduling state
  const [reschedulingApt, setReschedulingApt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rateResponse, appointmentsResponse] = await Promise.all([
        getHourlyRate().catch(() => null),
        getAppointments({ limit: 100 })
      ]);

      if (rateResponse?.rate) {
        setCurrentRate(rateResponse.rate.rateInRupees);
      }

      setAppointments(appointmentsResponse.appointments || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRate || parseFloat(newRate) <= 0) {
      setError('Please enter a valid rate');
      return;
    }

    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      await updateHourlyRate(parseFloat(newRate));
      setCurrentRate(parseFloat(newRate));
      setNewRate('');
      setSuccess('Hourly rate updated successfully!');
    } catch (err: any) {
      console.error('Error updating rate:', err);
      setError(err.response?.data?.message || 'Failed to update rate');
    } finally {
      setUpdating(false);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!reschedulingApt || !rescheduleDate || !rescheduleTime) {
      alert('Please select date and time');
      return;
    }

    setUpdating(true);
    try {
      const res = await rescheduleAppointment(reschedulingApt._id, {
        date: rescheduleDate,
        startTime: rescheduleTime
      });
      if (res.success) {
        alert('Appointment rescheduled and client notified!');
        setReschedulingApt(null);
        fetchData();
      }
    } catch (err: any) {
      console.error('Reschedule error:', err);
      alert(err.response?.data?.message || 'Rescheduling failed. Slot might be taken.');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-green-500',
      completed: 'bg-blue-500',
      cancelled: 'bg-red-500',
      'no-show': 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  const getAppointmentsForDate = (dateStr: string) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date).toISOString().split('T')[0];
      return aptDate === dateStr;
    });
  };

  // Group appointments by date for calendar
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    appointments.forEach(apt => {
      const dateStr = new Date(apt.date).toISOString().split('T')[0];
      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push(apt);
    });
    return grouped;
  }, [appointments]);

  const navigateMonth = (direction: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
    setSelectedDate(null);
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50"></div>);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayAppointments = appointmentsByDate[dateStr] || [];
      const isToday = new Date().toISOString().split('T')[0] === dateStr;
      const isSelected = selectedDate === dateStr;

      days.push(
        <div 
          key={day} 
          onClick={() => setSelectedDate(dateStr)}
          className={`h-24 border border-gray-100 p-1 cursor-pointer transition hover:bg-gray-50 ${isSelected ? 'ring-2 ring-mnkhan-orange' : ''} ${isToday ? 'bg-orange-50' : 'bg-white'}`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-mnkhan-orange' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="space-y-1 overflow-hidden">
            {dayAppointments.slice(0, 2).map((apt) => (
              <div 
                key={apt._id} 
                className={`text-[10px] px-1 py-0.5 rounded truncate text-white ${getStatusColor(apt.status)}`}
              >
                {apt.startTime} {apt.customerName.split(' ')[0]}
              </div>
            ))}
            {dayAppointments.length > 2 && (
              <div className="text-[10px] text-gray-500 pl-1">
                +{dayAppointments.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ← Prev
          </button>
          <h3 className="text-lg font-semibold text-gray-900">{formatMonthYear(currentMonth)}</h3>
          <button 
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            Next →
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-bold text-gray-500 uppercase py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          {days}
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              Appointments for {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h4>
            {getAppointmentsForDate(selectedDate).length === 0 ? (
              <p className="text-gray-500 text-sm">No appointments on this day.</p>
            ) : (
              <div className="space-y-3">
                {getAppointmentsForDate(selectedDate).map(apt => (
                  <div key={apt._id} className="bg-white rounded-lg p-4 border border-gray-200 flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{apt.customerName}</div>
                      <div className="text-sm text-gray-500">{apt.customerEmail}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        🕐 {apt.startTime} - {apt.endTime} ({apt.duration}h)
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(apt.status)}`}>
                          {apt.status}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <button 
                          onClick={() => setReschedulingApt(apt)}
                          className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest"
                        >
                          Reschedule
                        </button>
                        {apt.googleMeetLink && (
                          <a 
                            href={apt.googleMeetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-mnkhan-orange hover:underline uppercase tracking-widest"
                          >
                            Join Meet
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderList = () => (
    <div className="overflow-x-auto">
      {appointments.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No appointments found.</div>
      ) : (
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {appointments.map((apt) => (
              <tr key={apt._id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="font-medium text-gray-900">{apt.customerName}</div>
                  <div className="text-sm text-gray-500">{apt.customerEmail}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-gray-900">{new Date(apt.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</div>
                  <div className="text-sm text-gray-500">{apt.startTime} - {apt.endTime}</div>
                </td>
                <td className="px-4 py-4 text-gray-900">{apt.duration}h</td>
                <td className="px-4 py-4 text-gray-900 font-medium">₹{(apt.totalAmount / 100).toLocaleString()}</td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(apt.status)}`}>
                    {apt.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setReschedulingApt(apt)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase tracking-widest"
                    >
                      Reschedule
                    </button>
                    {apt.googleMeetLink && (
                      <a href={apt.googleMeetLink} target="_blank" rel="noopener noreferrer" className="text-mnkhan-orange hover:underline text-xs font-bold uppercase tracking-widest">
                        Join
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderRateSettings = () => (
    <div className="max-w-md">
      <div className="bg-mnkhan-charcoal text-white p-6 rounded-lg mb-6">
        <p className="text-sm text-gray-400 mb-2">Current Hourly Rate</p>
        <p className="text-4xl font-bold">₹{currentRate.toLocaleString()}<span className="text-lg font-normal text-gray-400">/hour</span></p>
      </div>

      <form onSubmit={handleUpdateRate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Update Rate (in ₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">₹</span>
            <input
              type="number"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              placeholder="Enter new hourly rate"
              min="0"
              step="100"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mnkhan-orange focus:border-transparent text-lg"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={updating || !newRate}
          className="w-full px-4 py-3 bg-mnkhan-orange hover:bg-mnkhan-orange-hover text-white rounded-lg font-bold disabled:opacity-50 transition"
        >
          {updating ? 'Updating...' : 'Update Hourly Rate'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Appointments</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${activeTab === 'calendar' ? 'border-mnkhan-orange text-mnkhan-orange' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          📅 Calendar View
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${activeTab === 'list' ? 'border-mnkhan-orange text-mnkhan-orange' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          📋 List View
        </button>
        <button
          onClick={() => setActiveTab('rate')}
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${activeTab === 'rate' ? 'border-mnkhan-orange text-mnkhan-orange' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          💰 Hourly Rate
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <>
            {activeTab === 'calendar' && renderCalendar()}
            {activeTab === 'list' && renderList()}
            {activeTab === 'rate' && renderRateSettings()}
          </>
        )}
      </div>

      {/* Reschedule Modal */}
      {reschedulingApt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-mnkhan-charcoal mb-4">Reschedule Appointment</h3>
            <p className="text-sm text-mnkhan-text-muted mb-6">
              Rescheduling for <strong>{reschedulingApt.customerName}</strong>. 
              The client will receive an email notification with the new details.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted mb-1">New Date</label>
                <input 
                  type="date" 
                  value={rescheduleDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setRescheduleDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-mnkhan-orange outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted mb-1">New Time</label>
                <input 
                  type="time" 
                  value={rescheduleTime}
                  onChange={e => setRescheduleTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-mnkhan-orange outline-none"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={handleRescheduleSubmit}
                disabled={updating || !rescheduleDate || !rescheduleTime}
                className="flex-1 bg-mnkhan-orange text-white py-3 font-bold uppercase tracking-widest text-xs hover:bg-mnkhan-charcoal disabled:opacity-50 transition-all"
              >
                {updating ? 'Processing...' : 'Confirm Reschedule'}
              </button>
              <button 
                onClick={() => setReschedulingApt(null)}
                className="px-6 border border-gray-300 font-bold uppercase tracking-widest text-[10px] hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAppointments;

