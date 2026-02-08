import client from './client';

export const getUsers = () => client.get('/admin/users');
export const updateUserStatus = (id: string, status: string) => client.patch(`/admin/users/${id}/status`, { status });
export const resetClientPassword = (id: string, password: string) => client.post(`/admin/users/${id}/reset-password`, { password });

export const getStaff = () => client.get('/admin/staff');
export const createStaff = (data: any) => client.post('/admin/staff', data);
export const resetStaffPassword = (id: string, password: string) => client.post(`/admin/staff/${id}/reset-password`, { password });
