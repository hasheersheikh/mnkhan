import client from './client';

export const getPeople = () => client.get('/people');
export const createPerson = (data: any) => client.post('/admin/people', data);
export const updatePerson = (id: string, data: any) => client.patch(`/admin/people/${id}`, data);
export const deletePerson = (id: string) => client.delete(`/admin/people/${id}`);
export const reorderPeople = (orders: { id: string; order: number }[]) => client.post('/admin/people/reorder', { orders });
