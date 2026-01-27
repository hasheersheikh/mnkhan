import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router';
import ServicesSection from './ServicesSection';
import InquiryForm from './InquiryForm';
import { getBlogs } from '../../api/blogs';

const LandingPage: React.FC = () => {
  const { setShowLogin } = useOutletContext<{ setShowLogin: (show: boolean) => void }>();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(3);
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
        console.error('Failed to fetch insights:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="relative text-mnkhan-charcoal overflow-hidden">
      {/* Dot Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, #333132 1px, transparent 1px)', 
          backgroundSize: '30px 30px' 
        }} 
      />

      <main className="relative z-10">
        {/* Left Content - Hero */}
        <section className="max-w-7xl mx-auto px-8 pt-20 pb-32 grid grid-cols-12 gap-12">
          <div className="col-span-12 lg:col-span-8">
            <div className="flex items-center gap-3 mb-8">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mnkhan-orange opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-mnkhan-orange"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-mnkhan-text-muted">
                Global Operations: Active
              </span>
            </div>

            <h1 className="text-7xl md:text-8xl leading-none font-normal mb-8 tracking-tight">
              Defining the <br />
              <span className="text-mnkhan-orange italic serif font-normal">Future</span> of Law.
            </h1>

            <p className="text-xl text-mnkhan-text-muted max-w-2xl leading-relaxed mb-12">
              Providing innovative legal solutions across industries and borders. 
              We partner with clients to navigate complex challenges and seize opportunities.
            </p>

            <div className="flex gap-4">
              <a href="#services" className="border-2 border-mnkhan-charcoal px-8 py-4 font-bold hover:bg-mnkhan-charcoal hover:text-white transition-all text-center">
                Our Expertise
              </a>
              <button 
                onClick={() => setShowLogin(true)}
                className="text-mnkhan-charcoal font-bold flex items-center gap-2 group underline-offset-4 hover:underline"
              >
                Client Access Portal 
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>

          {/* Right Sidebar - Locations & CTA */}
          <div className="hidden lg:block lg:col-span-4 space-y-8">
            <div className="p-8 border border-mnkhan-gray-border bg-white/50 backdrop-blur-md rounded-lg shadow-sm">
              <h3 className="font-serif text-2xl mb-4">Our Offices</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-mnkhan-orange mt-2 flex-shrink-0"></span>
                  <div>
                    <p className="font-bold text-mnkhan-charcoal">Mumbai</p>
                    <p className="text-sm text-mnkhan-text-muted">Financial & Corporate Hub</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-mnkhan-orange mt-2 flex-shrink-0"></span>
                  <div>
                    <p className="font-bold text-mnkhan-charcoal">Pune</p>
                    <p className="text-sm text-mnkhan-text-muted">Technology & IP Practice</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-mnkhan-orange mt-2 flex-shrink-0"></span>
                  <div>
                    <p className="font-bold text-mnkhan-charcoal">Nagpur</p>
                    <p className="text-sm text-mnkhan-text-muted">Central India Operations</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-mnkhan-gray-border mt-6">
                <p className="italic text-sm text-mnkhan-text-muted leading-relaxed">
                  "With presence across India, we're always within reach."
                </p>
              </div>
            </div>

            <div className="p-8 bg-mnkhan-charcoal text-white rounded-lg overflow-hidden relative">
               <div className="relative z-10">
                 <h3 className="text-xl serif italic mb-2">Book a Consultation</h3>
                 <p className="text-sm opacity-70 mb-6">Schedule a one-on-one session with our legal experts. Online appointments available.</p>
                 <Link 
                   to="/appointment"
                   className="block w-full bg-mnkhan-orange py-3 font-bold hover:bg-mnkhan-orange-hover transition-colors text-center"
                 >
                   Book Appointment →
                 </Link>
                 <button 
                  onClick={() => setShowLogin(true)}
                  className="w-full mt-3 border border-white/30 py-3 font-bold hover:bg-white/10 transition-colors"
                 >
                   Client Portal
                 </button>
               </div>
               {/* Decorative Background Element */}
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-mnkhan-orange rounded-full blur-3xl opacity-20" />
            </div>
          </div>
        </section>

        {/* Dynamic Services Section */}
        <ServicesSection />

        {/* Inquiry Form */}
        <InquiryForm />

        {/* Recent Insights Section */}
        <div className="max-w-7xl mx-auto px-8 py-24 mb-20" id="knowledge">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-3xl serif border-b-2 border-mnkhan-orange inline-block pb-1">Latest Insights</h2>
            <Link to="/knowledge" className="text-xs font-bold uppercase tracking-widest text-mnkhan-orange hover:underline">
              View All Knowledge Center →
            </Link>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-50 animate-pulse border border-mnkhan-gray-border" />)}
             </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {blogs.slice(0, visibleCount).map((item) => (
                  <Link 
                    to={`/knowledge/${item._id}`}
                    key={item._id} 
                    className="group p-8 border border-mnkhan-gray-border hover:border-mnkhan-orange bg-white transition-all cursor-pointer flex flex-col"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-mnkhan-orange">{item.category}</span>
                    <h4 className="text-xl font-bold mt-3 mb-4 group-hover:text-mnkhan-orange transition-colors tracking-tight line-clamp-2">{item.title}</h4>
                    <p className="text-sm text-mnkhan-text-muted leading-relaxed line-clamp-3 mb-6 flex-grow">{item.excerpt}</p>
                    <div className="pt-6 border-t border-gray-100 flex justify-between items-center mt-auto">
                      <span className="text-[10px] font-bold text-mnkhan-text-muted uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</span>
                      <span className="text-xs font-bold uppercase text-mnkhan-charcoal group-hover:text-mnkhan-orange transition-colors">Read More →</span>
                    </div>
                  </Link>
                ))}
              </div>

              {blogs.length > visibleCount && (
                <div className="mt-16 text-center">
                  <button 
                    onClick={() => setVisibleCount(prev => prev + 3)}
                    className="bg-mnkhan-charcoal text-white px-10 py-4 font-bold uppercase tracking-widest text-xs hover:bg-mnkhan-orange transition-all"
                  >
                    Show More Insights
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
