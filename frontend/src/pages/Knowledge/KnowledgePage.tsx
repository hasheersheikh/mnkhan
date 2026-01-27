import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getBlogs } from '../../api/blogs';

interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  createdAt: string;
}

const KnowledgePage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogs()
      .then(res => {
        if (res.data.success) {
          setBlogs(res.data.blogs);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch blogs:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-32">
      {/* Search & Header */}
      <section className="bg-mnkhan-charcoal py-24 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 relative z-10 text-center">
          <h1 className="text-6xl md:text-7xl font-serif italic mb-8">Knowledge Center.</h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-12">
            Stay ahead of regulatory shifts with expert insights from the MN KHAN legal team.
          </p>
          <div className="max-w-xl mx-auto relative">
            <input 
              type="text" 
              placeholder="Search legal insights..." 
              className="w-full bg-white/10 border border-white/20 px-8 py-4 rounded-sm outline-none focus:border-mnkhan-orange transition-colors text-white"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-mnkhan-orange font-bold uppercase tracking-widest text-xs">
              Search
            </button>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-mnkhan-orange/5 blur-[120px] rounded-full translate-y-1/2" />
      </section>

      {/* Article List */}
      <section className="max-w-7xl mx-auto px-8 mt-20">
        <div className="flex items-center justify-between mb-12 border-b border-mnkhan-gray-border pb-6">
          <h2 className="text-2xl font-serif italic text-mnkhan-charcoal">Latest Insights</h2>
          <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
            {['All', 'Corporate', 'IP', 'Taxes', 'Startups'].map(cat => (
              <button key={cat} className="text-xs font-bold uppercase tracking-widest text-mnkhan-text-muted hover:text-mnkhan-orange transition-colors whitespace-nowrap">
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-[400px] bg-white border border-mnkhan-gray-border animate-pulse" />
            ))
          ) : blogs.length > 0 ? (
            blogs.map((blog) => (
              <Link 
                to={`/knowledge/${blog._id}`}
                key={blog._id} 
                className="bg-white border border-mnkhan-gray-border shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col group rounded-sm overflow-hidden"
              >
                <div className="p-10 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-orange">{blog.category}</span>
                    <span className="text-[10px] text-mnkhan-text-muted font-medium uppercase tracking-widest">
                      {Math.ceil(blog.content.length / 1000) + 2} min read
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:text-mnkhan-orange transition-colors leading-tight">
                    {blog.title}
                  </h3>
                  <p className="text-mnkhan-text-muted text-sm leading-relaxed mb-8 flex-grow line-clamp-3">
                    {blog.excerpt}
                  </p>
                  <div className="pt-8 border-t border-mnkhan-gray-border flex justify-between items-center mt-auto">
                    <span className="text-[10px] font-bold text-mnkhan-text-muted uppercase tracking-widest">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-mnkhan-charcoal group-hover:text-mnkhan-orange transition-colors">
                      Read More →
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center italic text-mnkhan-text-muted">
              No articles found in the collection.
            </div>
          )}
        </div>

        {/* Newsletter Selection */}
        <div className="mt-32 p-16 bg-mnkhan-orange text-white rounded-sm text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-serif italic mb-6">Deep Insight Weekly</h2>
            <p className="text-white/80 max-w-xl mx-auto mb-10 leading-relaxed">
              Curated legal briefing for founders and directors. 
              Straight to your inbox, every Monday.
            </p>
            <div className="flex flex-col sm:flex-row max-w-lg mx-auto gap-4">
              <input 
                type="email" 
                placeholder="professional@email.com" 
                className="flex-grow bg-white/20 border border-white/30 px-6 py-4 rounded-sm placeholder:text-white/50 outline-none focus:border-white transition-colors"
              />
              <button className="bg-mnkhan-charcoal text-white px-10 py-4 font-bold uppercase tracking-widest text-xs hover:bg-black transition-all">
                Subscribe
              </button>
            </div>
          </div>
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        </div>
      </section>
    </div>
  );
};

export default KnowledgePage;
