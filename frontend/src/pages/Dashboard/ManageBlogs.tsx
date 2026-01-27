import React, { useEffect, useState } from 'react';
import * as blogsApi from '../../api/blogs';

interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  createdAt: string;
}

const ManageBlogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Partial<Blog>>({
    title: '',
    excerpt: '',
    content: '',
    category: 'Legal Insights',
    author: 'MN KHAN Team'
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await blogsApi.getBlogs();
      if (res.data.success) {
        setBlogs(res.data.blogs);
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentBlog._id) {
        await blogsApi.updateBlog(currentBlog._id, currentBlog);
      } else {
        await blogsApi.createBlog(currentBlog);
      }
      setIsEditing(false);
      setCurrentBlog({ title: '', excerpt: '', content: '', category: 'Legal Insights', author: 'MN KHAN Team' });
      fetchBlogs();
    } catch (err) {
      console.error('Error saving blog:', err);
      alert('Failed to save blog post.');
    }
  };

  const handleEdit = (blog: Blog) => {
    setCurrentBlog(blog);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await blogsApi.deleteBlog(id);
      fetchBlogs();
    } catch (err) {
      console.error('Error deleting blog:', err);
      alert('Failed to delete blog post.');
    }
  };

  if (loading && !isEditing) return <div className="p-8 text-center text-mnkhan-text-muted">Loading content...</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 text-mnkhan-charcoal">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif">Site Content</h1>
          <p className="text-mnkhan-text-muted mt-1">Manage legal insights, briefings, and reports.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-mnkhan-charcoal text-white px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-mnkhan-orange transition-colors"
          >
            Create New Post
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-white border border-mnkhan-gray-border p-8 mb-12 shadow-sm rounded-sm animate-in fade-in slide-in-from-top-4">
          <h2 className="text-xl font-serif mb-6 border-b border-mnkhan-gray-border pb-4">
            {currentBlog._id ? 'Edit Blog Post' : 'New Blog Post'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Title</label>
                <input 
                  type="text" 
                  required
                  value={currentBlog.title}
                  onChange={e => setCurrentBlog({...currentBlog, title: e.target.value})}
                  className="w-full border border-mnkhan-gray-border p-3 outline-none focus:border-mnkhan-orange"
                  placeholder="e.g. Navigating AI Regulations"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Category</label>
                <select 
                  value={currentBlog.category}
                  onChange={e => setCurrentBlog({...currentBlog, category: e.target.value})}
                  className="w-full border border-mnkhan-gray-border p-3 outline-none focus:border-mnkhan-orange bg-white"
                >
                  <option>Briefing</option>
                  <option>Report</option>
                  <option>Event</option>
                  <option>Legal Insights</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Short Excerpt</label>
              <textarea 
                required
                rows={2}
                value={currentBlog.excerpt}
                onChange={e => setCurrentBlog({...currentBlog, excerpt: e.target.value})}
                className="w-full border border-mnkhan-gray-border p-3 outline-none focus:border-mnkhan-orange"
                placeholder="A brief summary for the dashboard..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted">Full Content</label>
              <textarea 
                required
                rows={12}
                value={currentBlog.content}
                onChange={e => setCurrentBlog({...currentBlog, content: e.target.value})}
                className="w-full border border-mnkhan-gray-border p-3 outline-none focus:border-mnkhan-orange font-mono text-sm leading-relaxed"
                placeholder="Write your long-form legal analysis here..."
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button 
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setCurrentBlog({ title: '', excerpt: '', content: '', category: 'Legal Insights', author: 'MN KHAN Team' });
                }}
                className="px-6 py-3 text-xs font-bold uppercase tracking-widest hover:text-mnkhan-orange"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-mnkhan-charcoal text-white px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-mnkhan-orange transition-colors"
              >
                Save Content
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {blogs.map(blog => (
          <div key={blog._id} className="bg-white border border-mnkhan-gray-border p-6 flex justify-between items-center group hover:border-mnkhan-orange transition-all">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-orange">{blog.category}</span>
                <span className="text-mnkhan-text-muted">•</span>
                <span className="text-xs text-mnkhan-text-muted">{new Date(blog.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="text-lg font-bold mb-1">{blog.title}</h3>
              <p className="text-mnkhan-text-muted text-sm line-clamp-1">{blog.excerpt}</p>
            </div>
            <div className="flex gap-4 ml-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(blog)} className="text-xs font-bold uppercase tracking-widest hover:text-mnkhan-orange">Edit</button>
              <button onClick={() => handleDelete(blog._id)} className="text-xs font-bold uppercase tracking-widest text-red-500 hover:underline">Delete</button>
            </div>
          </div>
        ))}
        {blogs.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-mnkhan-gray-border text-mnkhan-text-muted italic">
            No site content published yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBlogs;
