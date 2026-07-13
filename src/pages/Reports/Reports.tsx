import { Fragment, useState } from 'react';
import OnHandReport from './OnHandReport';
import SubmittedOrdersReport from './SubmittedOrdersReport';
import IssuedBySportReport from './IssuedBySportReport';
import BudgetVsSpendReport from './BudgetVsSpendReport';
import OrderHistoryReport from './OrderHistoryReport';
import SizeBreakdownReport from './SizeBreakdownReport';

type Tab = 'on-hand' | 'submitted' | 'issued-by-sport' | 'budget' | 'order-history' | 'size-breakdown';

const TABS: { id: Tab; label: string }[] = [
  { id: 'on-hand',        label: 'On-Hand' },
  { id: 'submitted',      label: 'Submitted Orders' },
  { id: 'issued-by-sport', label: 'Issued by Sport' },
  { id: 'budget',         label: 'Budget vs. Spend' },
  { id: 'order-history',  label: 'Order History' },
  { id: 'size-breakdown', label: 'Size Breakdown' },
];

export default function Reports() {
  const [tab, setTab] = useState<Tab>('on-hand');

  return (
    <div>
      <span className="font-semibold text-[28px] underline decoration-[#FFD200] decoration-2 underline-offset-4" style={{ color: '#00539F' }}>Reports</span>
      {/* Sub-header nav matching other pages' filter bar style */}
      <div className="mb-3">
        <div className="overflow-x-auto">
          <div className="flex items-center gap-1.5 text-sm whitespace-nowrap min-w-max md:flex-wrap md:min-w-0">
            {TABS.map((t, i) => (
              <Fragment key={t.id}>
                {i > 0 && <span className="text-gray-300">|</span>}
                <button
                  onClick={() => setTab(t.id)}
                  className={`border-none bg-transparent focus:outline-none cursor-pointer text-sm whitespace-nowrap ${
                    tab === t.id ? 'text-[#00539F] font-semibold' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.label}
                </button>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-[0.2in] mt-2 md:mt-[0.1in]">
        {tab === 'on-hand' && <OnHandReport />}
        {tab === 'submitted' && <SubmittedOrdersReport />}
        {tab === 'issued-by-sport' && <IssuedBySportReport />}
        {tab === 'budget' && <BudgetVsSpendReport />}
        {tab === 'order-history' && <OrderHistoryReport />}
        {tab === 'size-breakdown' && <SizeBreakdownReport />}
      </div>
    </div>
  );
}
