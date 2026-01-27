import React from 'react';
import { Link } from 'react-router';

interface InsightsWidgetProps {
  blogs: any[];
  loading: boolean;
}

const InsightsWidget: React.FC<InsightsWidgetProps> = ({ blogs, loading }) => {
  return (
    <div className="col-span-12 bg-white p-6 rounded border border-mnkhan-gray-border hover:translate-y-[-2px] hover:shadow-lg transition-all duration-200">
      <h3 className="text-xl font-serif text-mnkhan-charcoal mb-6 border-b-2 border-mnkhan-orange inline-block pb-1">
        Knowledge & Insights
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-50 animate-pulse rounded" />)
        ) : blogs.length > 0 ? (
          blogs.map((item) => (
            <Link 
              to={`/knowledge/${item._id}`}
              key={item._id} 
              className="p-4 border border-gray-100 rounded hover:border-mnkhan-orange transition-all hover:translate-y-[-2px] block group bg-white shadow-sm hover:shadow-md"
            >
              <span className="text-[10px] text-mnkhan-orange font-bold uppercase tracking-wider">
                {item.category}
              </span>
              <h4 className="mt-2 mb-4 text-lg font-semibold leading-tight group-hover:text-mnkhan-orange transition-colors">{item.title}</h4>
              <span className="text-xs text-mnkhan-text-muted">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </Link>
          ))
        ) : (
          <p className="col-span-full italic text-mnkhan-text-muted py-8 text-center text-sm">No insights available.</p>
        )}
      </div>
    </div>
  );
};

export default InsightsWidget;
