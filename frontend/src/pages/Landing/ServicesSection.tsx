import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getServices } from '../../api/services';

interface Service {
  _id: string;
  name: string;
  description: string;
  price: string;
}

const ServicesSection: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    getServices()
      .then(res => {
        if (res.data.success) {
          setServices(res.data.services);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch services:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-mnkhan-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  const displayedServices = showAll ? services : services.slice(0, 3);

  const userRole = JSON.parse(localStorage.getItem('mnkhan_user') || '{}').role;
  const isStaff = userRole === 'staff';

  return (
    <section id="services" className="py-24 px-8 bg-white relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-4xl md:text-5xl font-serif border-b-2 border-mnkhan-orange inline-block pb-1 italic">Our Services</h2>
          {services.length > 3 && (
            <button 
              onClick={() => setShowAll(!showAll)}
              className="text-mnkhan-orange font-bold uppercase tracking-widest text-sm hover:underline underline-offset-8"
            >
              {showAll ? 'Show Less' : `View All ${services.length} Services`}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {displayedServices.map(service => (
            <Link 
              to={`/services/${service._id}`}
              key={service._id} 
              className="group p-10 border border-mnkhan-gray-border bg-[#FAFAFA] hover:bg-white hover:border-mnkhan-orange hover:shadow-2xl transition-all duration-500 rounded-sm flex flex-col"
            >
              <div className="w-12 h-[2px] bg-mnkhan-orange mb-8 group-hover:w-full transition-all duration-500" />
              <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:text-mnkhan-orange transition-colors">{service.name}</h3>
              <p className="text-mnkhan-text-muted leading-relaxed text-sm mb-6">
                {service.description}
              </p>
              {!isStaff && (
                <p className="text-lg font-bold text-mnkhan-charcoal mb-8">
                  <span className="text-mnkhan-orange">{service.price}</span>
                </p>
              )}
              <div className="mt-auto flex items-center text-xs font-bold uppercase tracking-widest text-mnkhan-orange opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                View Details <span className="ml-2">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
