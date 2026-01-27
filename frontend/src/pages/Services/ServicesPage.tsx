import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getServices } from '../../api/services';

interface Service {
  _id: string;
  name: string;
  description: string;
  price: string;
}

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-mnkhan-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Hero Section */}
      <section className="bg-mnkhan-charcoal py-24 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <h1 className="text-6xl md:text-7xl font-serif italic mb-6">Expert Services.</h1>
          <p className="text-xl text-white/60 max-w-2xl leading-relaxed">
            Premium legal and compliance solutions tailored for modern businesses. 
            Transparent pricing, expert guidance, and seamless execution.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-mnkhan-orange/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
      </section>

      {/* Services List */}
      <section className="max-w-7xl mx-auto px-8 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(service => (
            <Link 
              to={`/services/${service._id}`}
              key={service._id} 
              className="bg-white border border-mnkhan-gray-border p-10 shadow-sm hover:shadow-2xl hover:border-mnkhan-orange transition-all duration-500 flex flex-col group rounded-sm"
            >
              <div className="w-16 h-[2px] bg-mnkhan-orange mb-8 group-hover:w-full transition-all duration-500" />
              <h2 className="text-3xl font-bold mb-4 tracking-tight group-hover:text-mnkhan-orange transition-colors">{service.name}</h2>
              <p className="text-mnkhan-text-muted leading-relaxed mb-auto pb-8">
                {service.description}
              </p>
              
              <div className="mt-8 pt-8 border-t border-mnkhan-gray-border flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted mb-1">Professional Fee</p>
                  <p className="text-2xl font-bold text-mnkhan-charcoal">{service.price}</p>
                </div>
                <div className="bg-mnkhan-charcoal text-white px-6 py-3 font-bold uppercase tracking-widest text-xs group-hover:bg-mnkhan-orange transition-colors">
                  Details
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust Quote */}
      <section className="max-w-4xl mx-auto px-8 mt-40 text-center">
        <p className="text-3xl font-serif italic text-mnkhan-charcoal leading-relaxed">
          "MNKHAN provides more than just registration; we provide a foundation for your business growth."
        </p>
        <div className="w-20 h-1 bg-mnkhan-orange mx-auto mt-8" />
      </section>
    </div>
  );
};

export default ServicesPage;
