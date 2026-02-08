import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { getServiceById } from '../../api/services';
import InquiryForm from '../Landing/InquiryForm';

interface Service {
  _id: string;
  name: string;
  description: string;
  price: string;
  details: string;
  criteria: string;
  servicer?: string;
  acceptanceCreteria?: string;
}

const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      getServiceById(id)
        .then(res => {
          if (res.data.success) {
            setService(res.data.service);
          } else {
            setError(res.data.message || 'Service not found');
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch service details:', err);
          setError('Failed to load service details. Please try again later.');
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-mnkhan-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-3xl font-serif mb-4 text-red-600">Error</h2>
        <p className="text-mnkhan-text-muted mb-8">{error || 'Service not found'}</p>
        <Link to="/services" className="bg-mnkhan-charcoal text-white px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-mnkhan-orange transition-colors">
          Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Header Section */}
      <section className="bg-mnkhan-charcoal py-24 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <Link to="/services" className="text-mnkhan-orange font-bold uppercase tracking-widest text-xs mb-8 block hover:underline">
            ← All Services
          </Link>
          <h1 className="text-5xl md:text-6xl font-serif italic mb-6">{service.name}</h1>
          <p className="text-2xl font-bold text-mnkhan-orange mb-8">
            {service.price ? `₹${service.price}` : 'Login for price'}
          </p>
          <p className="text-xl text-white/60 max-w-3xl leading-relaxed">
            {service.description}
          </p>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-mnkhan-orange/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
      </section>

      {/* Details Grid */}
      <section className="max-w-7xl mx-auto px-8 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          {/* Service Provided */}
          <div className="p-10 border border-mnkhan-gray-border bg-[#FAFAFA] rounded-sm">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-mnkhan-orange mb-6 flex items-center gap-2">
              <span className="w-8 h-[1px] bg-mnkhan-orange" /> Service Provided
            </h2>
            <p className="text-mnkhan-charcoal text-lg leading-relaxed whitespace-pre-line">
              {service.servicer || service.details}
            </p>
          </div>

          {/* Acceptance Criteria */}
          <div className="p-10 border border-mnkhan-gray-border bg-[#FAFAFA] rounded-sm">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-mnkhan-orange mb-6 flex items-center gap-2">
              <span className="w-8 h-[1px] bg-mnkhan-orange" /> Acceptance Criteria
            </h2>
            <p className="text-mnkhan-charcoal text-lg leading-relaxed whitespace-pre-line">
              {service.acceptanceCreteria || service.criteria}
            </p>
          </div>
        </div>

        {/* Inquiry Section */}
        <div className="bg-mnkhan-charcoal rounded-sm overflow-hidden p-12 md:p-20 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-mnkhan-orange rounded-full blur-[120px] opacity-10" />
          <div className="relative z-10">
            <h3 className="text-3xl font-serif italic text-white mb-2 text-center">Procure this Service</h3>
            <p className="text-white/50 text-center mb-12">Submit your details below to start the engagement process for {service.name}.</p>
            <InquiryForm initialService={service.name} isEmbedded={true} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceDetailPage;
