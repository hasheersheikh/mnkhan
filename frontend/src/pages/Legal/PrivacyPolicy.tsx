import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Mini Hero */}
      <section className="bg-mnkhan-charcoal py-20 text-white mb-20">
        <div className="max-w-4xl mx-auto px-8">
          <h1 className="text-5xl md:text-6xl font-serif italic mb-4">Privacy Policy</h1>
          <p className="text-white/50 uppercase tracking-[0.2em] text-xs font-bold">Data Protection & Privacy Standards</p>
        </div>
      </section>

      <div className="pb-32 px-8 max-w-4xl mx-auto leading-relaxed text-mnkhan-charcoal">
        <section className="mb-16">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-mnkhan-orange mb-6 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-mnkhan-orange" /> 1. Information Collection
          </h2>
          <p className="text-mnkhan-text-muted text-lg mb-4">
            We collect personal and corporate data strictly necessary for the performance of our legal and compliance obligations. This includes identity documents, financial information, and commercial records provided through our secure intake forms and client portal.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-mnkhan-orange mb-6 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-mnkhan-orange" /> 2. Use of Information
          </h2>
          <p className="text-mnkhan-text-muted text-lg mb-4">
            Your data is utilized solely for:
          </p>
          <ul className="list-disc pl-6 text-mnkhan-text-muted space-y-2 mb-4">
            <li>Processing government filings and registrations.</li>
            <li>Providing bespoke legal counsel and strategic advice.</li>
            <li>Verifying client identity under Anti-Money Laundering (AML) regulations.</li>
            <li>Securing communications through our digital infrastructure.</li>
          </ul>
        </section>

        <section className="mb-16">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-mnkhan-orange mb-6 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-mnkhan-orange" /> 3. Data Security Protocols
          </h2>
          <p className="text-mnkhan-text-muted text-lg mb-4">
            MNKHAN employs high-grade AES-256 encryption for all data at rest and TLS 1.3 for data in transit. Our infrastructure is hosted on ISO 27001 certified data centers with strict access control management.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-mnkhan-orange mb-6 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-mnkhan-orange" /> 4. Disclosure to Third Parties
          </h2>
          <p className="text-mnkhan-text-muted text-lg mb-4">
            We do not monetize your data. Disclosures are made only to relevant government bodies (MCA, GSTN, Trademark Registry) for filing purposes or where compelled by law. All third-party service providers (e.g., cloud storage) are subject to strict data processing agreements.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-mnkhan-orange mb-6 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-mnkhan-orange" /> 5. Data Retention
          </h2>
          <p className="text-mnkhan-text-muted text-lg mb-4">
            As a legal firm, we retain client records in accordance with professional regulation and statutory requirements for audit and compliance purposes, typically for a period of 8 years post-engagement.
          </p>
        </section>

        <div className="mt-20 pt-12 border-t border-mnkhan-gray-border flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted mb-2">Last Modified</p>
            <p className="text-mnkhan-charcoal font-medium">January 17, 2026</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted mb-2">DPO Contact</p>
            <p className="text-mnkhan-charcoal font-medium">privacy@mnkhan.com</p>
          </div>
          <div className="md:text-right">
            <p className="text-mnkhan-text-muted text-xs">&copy; 2026 MNKHAN . <br/>Committed to client confidentiality.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
