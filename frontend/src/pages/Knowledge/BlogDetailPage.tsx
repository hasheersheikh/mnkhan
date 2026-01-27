import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { getBlogById } from '../../api/blogs';

interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  createdAt: string;
}

const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      getBlogById(id)
        .then(res => {
          if (res.data.success) {
            setBlog(res.data.blog);
          } else {
            setError('Post not found.');
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load blog:', err);
          setError('Failed to load the article.');
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-mnkhan-orange border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error || !blog) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <h2 className="text-3xl font-serif mb-4 text-red-600">Error</h2>
      <p className="text-mnkhan-text-muted mb-8">{error || 'Article not found'}</p>
      <Link to="/knowledge" className="bg-mnkhan-charcoal text-white px-8 py-3 font-bold uppercase tracking-widest text-xs">
        Back to Knowledge
      </Link>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Header */}
      <section className="bg-mnkhan-charcoal py-24 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 relative z-10 text-center">
          <Link to="/knowledge" className="text-mnkhan-orange font-bold uppercase tracking-widest text-[10px] mb-8 block hover:underline">
            ← Knowledge Center
          </Link>
          <p className="text-mnkhan-orange font-bold uppercase tracking-[0.3em] text-[10px] mb-6">{blog.category}</p>
          <h1 className="text-5xl md:text-6xl font-serif italic mb-8 leading-tight">{blog.title}</h1>
          <div className="flex items-center justify-center gap-6 text-white/60 text-sm">
            <span>By {blog.author}</span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span>{new Date(blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-mnkhan-orange/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-mnkhan-orange/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
      </section>

      {/* Content */}
      <article className="max-w-7xl mx-auto px-8 -mt-12 relative z-20">
        <div className="bg-white p-12 md:p-20 border border-mnkhan-gray-border shadow-xl rounded-sm">
          <div className="prose prose-lg prose-mnkhan max-w-none">
            <p className="text-2xl text-mnkhan-charcoal font-serif italic mb-12 leading-relaxed opacity-80">
              {blog.excerpt}
            </p>
            <div className="text-mnkhan-charcoal text-lg leading-loose space-y-8 whitespace-pre-wrap">
              {blog.content}
            </div>
          </div>

          <div className="mt-20 pt-12 border-t border-mnkhan-gray-border flex flex-col items-center gap-8">
            <div className="w-12 h-1 bg-mnkhan-orange" />
            <p className="text-center text-mnkhan-text-muted italic max-w-lg">
              &copy; 2026 MN KHAN . All rights reserved. 
              The information provided above is for educational purposes and does not constitute legal advice.
            </p>
            <Link to="/knowledge" className="mt-4 text-mnkhan-orange font-bold uppercase tracking-widest text-[10px] hover:underline">
              Browse More Articles
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogDetailPage;
