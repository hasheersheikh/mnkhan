import client from './client';

export interface AppointmentData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  startTime: string;
  duration: number;
  notes?: string;
  timezone?: string;
}

export interface RazorpayOrderResponse {
  success: boolean;
  message: string;
  paymentBypassed?: boolean;
  appointment: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    totalAmount: number;
    currency: string;
  };
  razorpay?: {
    orderId: string;
    amount: number;
    currency: string;
    key: string;
  };
}

export interface PaymentVerifyData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  appointmentId: string;
}

export interface HourlyRateResponse {
  success: boolean;
  rate: {
    id: string;
    rate: number;
    rateInRupees: number;
    currency: string;
    effectiveFrom: string;
  };
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AvailabilityResponse {
  success: boolean;
  date: string;
  slots: TimeSlot[];
}

// Create appointment and get Razorpay order
export const createAppointment = async (data: AppointmentData): Promise<RazorpayOrderResponse> => {
  const response = await client.post('/appointment', data);
  return response.data;
};

// Verify payment after Razorpay callback
export const verifyPayment = async (data: PaymentVerifyData) => {
  const response = await client.post('/appointment/verify-payment', data);
  return response.data;
};

// Get current hourly rate
export const getHourlyRate = async (): Promise<HourlyRateResponse> => {
  const response = await client.get('/hourly-rate');
  return response.data;
};

// Update hourly rate (admin only)
export const updateHourlyRate = async (rate: number, currency = 'INR') => {
  const response = await client.put('/hourly-rate', { rate, currency });
  return response.data;
};

// Get available time slots for a date
export const getAvailability = async (date: string, timezone = 'Asia/Kolkata'): Promise<AvailabilityResponse> => {
  const response = await client.get('/appointment/availability', {
    params: { date, timezone }
  });
  return response.data;
};

// Get appointment by ID
export const getAppointment = async (id: string) => {
  const response = await client.get(`/appointment/${id}`);
  return response.data;
};

// Get all appointments (admin)
export const getAppointments = async (params?: {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await client.get('/appointment', { params });
  return response.data;
};

// Cancel appointment
export const cancelAppointment = async (id: string, reason?: string) => {
  const response = await client.patch(`/appointment/${id}/cancel`, { reason });
  return response.data;
};

// Reschedule appointment
export const rescheduleAppointment = async (id: string, data: { date: string; startTime: string }) => {
  const response = await client.patch(`/appointment/${id}/reschedule`, data);
  return response.data;
};

// Delete appointment (admin only)
export const deleteAppointment = async (id: string) => {
  const response = await client.delete(`/appointment/${id}`);
  return response.data;
};
