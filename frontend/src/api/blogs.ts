import client from './client';

export const getBlogs = () => client.get('/blogs');
export const getBlogById = (id: string) => client.get(`/blogs/${id}`);
export const createBlog = (data: any) => client.post('/blogs', data);
export const updateBlog = (id: string, data: any) => client.patch(`/blogs/${id}`, data);
export const deleteBlog = (id: string) => client.delete(`/blogs/${id}`);
