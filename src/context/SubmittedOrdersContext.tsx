import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Order } from '../data/types';

export interface SubmittedOrderRecord {
  recordId: string;
  order: Order;
  submittedAt: string;
  submittedBy: string;
}

interface SubmittedOrdersContextValue {
  submittedRecords: SubmittedOrderRecord[];
  recordSubmission: (order: Order, submittedBy: string) => void;
}

const SubmittedOrdersContext = createContext<SubmittedOrdersContextValue | null>(null);

export function SubmittedOrdersProvider({ children }: { children: ReactNode }) {
  const [submittedRecords, setSubmittedRecords] = useState<SubmittedOrderRecord[]>([]);

  function recordSubmission(order: Order, submittedBy: string) {
    setSubmittedRecords((prev) => [
      { recordId: `${order.id}-${Date.now()}`, order, submittedAt: new Date().toISOString(), submittedBy },
      ...prev,
    ]);
  }

  return (
    <SubmittedOrdersContext.Provider value={{ submittedRecords, recordSubmission }}>
      {children}
    </SubmittedOrdersContext.Provider>
  );
}

export function useSubmittedOrders() {
  const ctx = useContext(SubmittedOrdersContext);
  if (!ctx) throw new Error('useSubmittedOrders must be used within SubmittedOrdersProvider');
  return ctx;
}
