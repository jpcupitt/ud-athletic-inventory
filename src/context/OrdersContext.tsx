import { createContext, useContext, type ReactNode } from 'react';
import { orders as mockOrders } from '../data/mock/orders';
import type { Order } from '../data/types';
import { usePersistentState } from '../hooks/usePersistentState';

interface OrdersContextValue {
  localOrders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (id: string, changes: Partial<Order>) => void;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [localOrders, setLocalOrders] = usePersistentState<Order[]>('orders', () => [...mockOrders]);

  function addOrder(order: Order) {
    setLocalOrders((prev) => [order, ...prev]);
  }

  function updateOrder(id: string, changes: Partial<Order>) {
    setLocalOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...changes } : o)));
  }

  return (
    <OrdersContext.Provider value={{ localOrders, addOrder, updateOrder }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within OrdersProvider');
  return ctx;
}
