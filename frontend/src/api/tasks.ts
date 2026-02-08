import client from './client';

export const getTasks = (userId?: string) => client.get('/tasks', { params: { userId } });
export const getTaskById = (id: string) => client.get(`/tasks/${id}`);
export const createTask = (data: any) => client.post('/tasks', data);
export const updateTask = (id: string, data: any) => client.patch(`/tasks/${id}`, data);
export const deleteTask = (id: string) => client.delete(`/tasks/${id}`);

export const addComment = (id: string, text: string) => client.post(`/tasks/${id}/comments`, { text });
