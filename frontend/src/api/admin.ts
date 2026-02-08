import client from './client';

export const getUsers = () => client.get('/admin/users');
export const updateUserStatus = (id: string, status: string) => client.patch(`/admin/users/${id}/status`, { status });
