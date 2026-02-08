import client from './client';

export const getVouchers = () => client.get('/vouchers');
export const createVoucher = (data: any) => client.post('/vouchers', data);
export const updateVoucher = (id: string, data: any) => client.patch(`/vouchers/${id}`, data);
export const deleteVoucher = (id: string) => client.delete(`/vouchers/${id}`);
export const validateVoucher = (code: string) => client.post('/vouchers/validate', { code });
