import client from './client';

export const submitInquiry = (data: any) => client.post('/inquiries', data);
export const getInquiries = () => client.get('/inquiries');
export const getMyInquiries = () => client.get('/inquiries/my');
export const updateInquiry = (id: string, data: { status: string }) => client.patch(`/inquiries/${id}`, data);
export const deleteInquiry = (id: string) => client.delete(`/inquiries/${id}`);
