import { useMemo } from 'react';
import { transactions } from '../data/mock/transactions';
import { useInventory } from '../context/InventoryContext';
import { useOrders } from '../context/OrdersContext';
import { useAthletes } from '../context/AthletesContext';
import { useStaff } from '../context/StaffContext';
import { useSportsAccess } from './useSportsAccess';

export interface OverdueReturn {
  key: string;
  personId: string;
  personType: 'athlete' | 'staff';
  personName: string;
  description: string;
  returnByDate: string;
}

export interface LowInventoryItem {
  key: string;
  id: string;
  description: string;
  category: string;
  sports: string[];
  qtyOnHand: number;
}

export interface PendingOrder {
  key: string;
  id: string;
  refNumber: string;
  sport: string;
  vendor: string;
}

export function useNotifications() {
  const { items: inventoryItems } = useInventory();
  const { localOrders: orders } = useOrders();
  const { athletes } = useAthletes();
  const { staff } = useStaff();
  const { isLead, assignedSet } = useSportsAccess();

  // Sport-scope helper — matches the filtering the pages use so the bell/badges
  // reflect only what the current user can actually see.
  const inScope = useMemo(
    () => (sports: string[]) => isLead || sports.some((s) => assignedSet.has(s)),
    [isLead, assignedSet]
  );

  const overdueReturns = useMemo<OverdueReturn[]>(() => {
    const today = new Date();
    const result: OverdueReturn[] = [];
    for (const person of athletes) {
      if (!inScope(person.sports)) continue;
      for (const item of person.issuedItems) {
        if (item.isNonExpendable && !item.returned && item.returnByDate) {
          if (new Date(item.returnByDate) < today) {
            result.push({
              key: `overdue-${person.id}-${item.issueId ?? item.itemId}`,
              personId: person.id,
              personType: 'athlete',
              personName: `${person.lastName}, ${person.firstName}`,
              description: item.description,
              returnByDate: item.returnByDate,
            });
          }
        }
      }
    }
    for (const person of staff) {
      if (!inScope(person.sports)) continue;
      for (const item of person.issuedItems) {
        if (item.isNonExpendable && !item.returned && item.returnByDate) {
          if (new Date(item.returnByDate) < today) {
            result.push({
              key: `overdue-${person.id}-${item.issueId ?? item.itemId}`,
              personId: person.id,
              personType: 'staff',
              personName: `${person.lastName}, ${person.firstName}`,
              description: item.description,
              returnByDate: item.returnByDate,
            });
          }
        }
      }
    }
    return result;
  }, [athletes, staff, inScope]);

  const lowInventory = useMemo<LowInventoryItem[]>(
    () => inventoryItems
      .filter((i) => i.qtyOnHand < 3 && inScope(i.sports))
      .map((i) => ({ key: `low-${i.id}`, id: i.id, description: i.description, category: i.category, sports: i.sports, qtyOnHand: i.qtyOnHand })),
    [inventoryItems, inScope]
  );

  const ordersForApproval = useMemo<PendingOrder[]>(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return orders
      .filter((o) => o.status === 'incomplete' && new Date(o.orderDate) >= oneWeekAgo && inScope([o.sport]))
      .map((o) => ({ key: `order-${o.id}`, id: o.id, refNumber: o.refNumber, sport: o.sport, vendor: o.vendor }));
  }, [orders, inScope]);

  const recentTransactions = useMemo(
    () => [...transactions]
      .filter((t) => inScope([t.sport]))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 10),
    [inScope]
  );

  const count = overdueReturns.length + lowInventory.length + ordersForApproval.length;

  return { overdueReturns, lowInventory, ordersForApproval, recentTransactions, count };
}
