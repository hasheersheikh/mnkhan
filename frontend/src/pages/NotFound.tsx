import React from 'react';
import { Link } from 'react-router';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-mnkhan-charcoal flex items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-mnkhan-orange/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-mnkhan-orange/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 max-w-xl">
        <h1 className="text-[12rem] font-serif italic text-mnkhan-orange leading-none mb-4 opacity-20">404</h1>
        <div className="-mt-24">
          <h2 className="text-5xl font-serif italic text-white mb-6">Matter Not Found.</h2>
          <p className="text-white/60 text-lg mb-12 leading-relaxed">
            The page you are looking for has been moved, removed, or never existed in our records. 
            Please return to our main portal or landing page.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/" 
              className="bg-mnkhan-orange text-white px-10 py-4 font-bold uppercase tracking-widest text-xs hover:bg-mnkhan-orange-hover transition-all"
            >
              Back to Home
            </Link>
            <Link 
              to="/portal" 
              className="bg-white/10 text-white border border-white/20 px-10 py-4 font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition-all"
            >
              Access Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
