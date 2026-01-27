import client from './client';

export const getTasks = () => client.get('/tasks');
export const createTask = (data: any) => client.post('/tasks', data);
export const updateTask = (id: string, data: any) => client.patch(`/tasks/${id}`, data);
export const deleteTask = (id: string) => client.delete(`/tasks/${id}`);
