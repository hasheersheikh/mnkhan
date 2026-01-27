import React from 'react';

interface FinancialWidgetProps {
  inquiries: any[];
  isAdmin: boolean;
}

const FinancialWidget: React.FC<FinancialWidgetProps> = ({ inquiries, isAdmin }) => {
  return (
    <div className="col-span-4 bg-white p-6 rounded border border-mnkhan-gray-border hover:translate-y-[-2px] hover:shadow-lg transition-all duration-200">
      <h3 className="text-xl font-serif text-mnkhan-charcoal mb-6 border-b-2 border-mnkhan-orange inline-block pb-1">
        {isAdmin ? 'Recent Inquiries' : 'Financial Summary'}
      </h3>
      
      {isAdmin ? (
        <div className="space-y-4 max-h-[200px] overflow-y-auto">
          {inquiries.length > 0 ? inquiries.map((inq) => (
            <div key={inq._id} className="text-xs border-b border-gray-50 pb-2">
              <p className="font-bold text-mnkhan-charcoal">{inq.service}</p>
              <p className="text-mnkhan-text-muted">{inq.name} • {inq.email}</p>
            </div>
          )) : <p className="italic text-mnkhan-text-muted text-xs">No pending inquiries.</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-mnkhan-text-muted text-sm">Unbilled Fees</p>
            <p className="text-2xl font-bold">₹0.00</p>
          </div>
          <div>
            <p className="text-mnkhan-text-muted text-sm">Recent Invoices</p>
            <p className="text-2xl font-bold text-mnkhan-orange">₹0.00</p>
          </div>
          <button className="mt-4 bg-transparent border border-mnkhan-charcoal py-2 w-full font-semibold hover:bg-mnkhan-charcoal hover:text-white transition-all text-xs">
            View Billing Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default FinancialWidget;
