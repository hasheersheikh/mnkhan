import client from './client';

export const getUsers = () => client.get('/admin/users');
