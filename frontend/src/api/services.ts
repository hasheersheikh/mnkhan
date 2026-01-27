import client from './client';

export const getServices = () => client.get('/services');
export const getServiceById = (id: string) => client.get(`/services/${id}`);
export const createService = (data: any) => client.post('/services', data);
export const updateService = (id: string, data: any) => client.patch(`/services/${id}`, data);
export const deleteService = (id: string) => client.delete(`/services/${id}`);
