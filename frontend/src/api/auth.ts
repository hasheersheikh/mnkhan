import client from './client';

export const login = (data: any) => client.post('/auth/login', data);
export const signup = (data: any) => client.post('/auth/signup', data);
export const forgotPassword = (email: string) => client.post('/auth/forgot-password', { email });
export const resetPasswordConfirmed = (token: string, password: string) => client.post('/auth/reset-password-confirmed', { token, newPassword: password });
