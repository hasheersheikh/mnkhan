import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="pb-20 px-8 md:px-20 max-w-4xl mx-auto leading-relaxed text-mnkhan-charcoal">
      <h1 className="text-5xl font-serif mb-12 border-b-2 border-mnkhan-orange inline-block pb-2">Terms of Service</h1>
      
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
        <p className="text-mnkhan-text-muted">
          By accessing and using the MNKHAN portal and services, you agree to be bound by these Terms of Service. 
          If you do not agree, please refrain from using our services.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">2. Legal Services</h2>
        <p className="text-mnkhan-text-muted">
          MNKHAN provides professional legal and compliance services. All services are subject to an initial consultation 
          and a formal engagement letter.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">3. User Responsibilities</h2>
        <p className="text-mnkhan-text-muted">
          Users are responsible for providing accurate information for registrations and filings. MNKHAN is not liable 
          for delays caused by incomplete or incorrect data provided by the user.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">4. Intellectual Property</h2>
        <p className="text-mnkhan-text-muted">
          All content provided on this portal is the property of MNKHAN . Unauthorized 
          reproduction is prohibited.
        </p>
      </section>

      <div className="mt-20 pt-8 border-t border-mnkhan-gray-border text-sm text-mnkhan-text-muted">
        Last Updated: January 17, 2026. &copy; MNKHAN LLP.
      </div>
    </div>
  );
};

export default TermsOfService;
