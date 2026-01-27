import client from './client';

export const login = (data: any) => client.post('/auth/login', data);
export const signup = (data: any) => client.post('/auth/signup', data);
