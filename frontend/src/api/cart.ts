import client from './client';

export const getCart = () => client.get('/cart');
export const addToCart = (serviceId: string) => client.post('/cart/add', { serviceId });
export const removeFromCart = (serviceId: string) => client.delete(`/cart/remove/${serviceId}`);
export const checkoutCart = (voucherCode?: string) => client.post('/cart/checkout', { voucherCode });
export const verifyCartPayment = (data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => client.post('/cart/verify-payment', data);
