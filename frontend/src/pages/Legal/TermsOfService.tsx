import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Mini Hero */}
      <section className="bg-mnkhan-charcoal py-20 text-white mb-20">
        <div className="max-w-4xl mx-auto px-8">
          <h1 className="text-5xl md:text-6xl font-serif italic mb-4">Terms of Service</h1>
          <p className="text-white/50 uppercase tracking-[0.2em] text-xs font-bold">Standard Professional Engagement Terms</p>
        </div>
      </section>

      <div className="pb-32 px-8 max-w-4xl mx-auto leading-relaxed text-mnkhan-charcoal">
        <section className="mb-16">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-mnkhan-orange mb-6 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-mnkhan-orange" /> 1. Professional Relationship
          </h2>
          <p className="text-mnkhan-text-muted text-lg mb-4">
            MNKHAN  ("the Firm") provides legal, tax, and compliance services. By accessing this portal or initiating a service inquiry, you acknowledge that a formal solicitor-client relationship is only established upon the execution of a bespoke Letter of Engagement.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-mnkhan-orange mb-6 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-mnkhan-orange" /> 2. Accuracy of Information
          </h2>
          <p className="text-mnkhan-text-muted text-lg mb-4">
            The effectiveness of our services depends on the accuracy and timeliness of the information provided by the client. The Firm shall not be held liable for any penalties, delays, or legal repercussions resulting from the provision of inaccurate, misleading, or incomplete documentation by the client.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-mnkhan-orange mb-6 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-mnkhan-orange" /> 3. Confidentiality & Privacy
          </h2>
          <p className="text-mnkhan-text-muted text-lg mb-4">
            We maintain the highest standards of professional confidentiality. Your data is processed in accordance with our Privacy Policy. All communications transmitted through our secure portal are encrypted and handled strictly by the designated case officers.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-mnkhan-orange mb-6 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-mnkhan-orange" /> 4. Fees & Disbursements
          </h2>
          <p className="text-mnkhan-text-muted text-lg mb-4">
            Professional fees quote on the portal refer to the Firm's service fee and do not include government levies, stamp duties, or third-party disbursements unless explicitly stated. All fees are payable in advance of the filing process.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-mnkhan-orange mb-6 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-mnkhan-orange" /> 5. Limitation of Liability
          </h2>
          <p className="text-mnkhan-text-muted text-lg mb-4">
            While we strive for 100% compliance accuracy, the final decision on registrations and legal approvals rests with the respective government authorities. The Firm's liability is strictly limited to the professional fees paid for the specific service in question.
          </p>
        </section>

        <div className="mt-20 pt-12 border-t border-mnkhan-gray-border flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted mb-2">Effective Date</p>
            <p className="text-mnkhan-charcoal font-medium">January 17, 2026</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted mb-2">Jurisdiction</p>
            <p className="text-mnkhan-charcoal font-medium">New Delhi, India</p>
          </div>
          <div className="md:text-right">
            <p className="text-mnkhan-text-muted text-xs">&copy; 2026 MNKHAN . <br/>All professional rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
