import { useMemo } from 'react';
import { transactions } from '../data/mock/transactions';
import { useInventory } from '../context/InventoryContext';
import { useOrders } from '../context/OrdersContext';
import { useAthletes } from '../context/AthletesContext';
import { useStaff } from '../context/StaffContext';
import { useSportsAccess } from './useSportsAccess';
import { useActiveSport } from '../context/SportContext';
import { recertDueDate, recertStatus } from '../utils/recert';

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

export interface RecertDue {
  key: string;
  itemId: string;
  serialNumber: string;
  description: string;
  sports: string[];
  status: 'due-soon' | 'overdue';
  dueDate: string;
}

export function useNotifications() {
  const { items: inventoryItems } = useInventory();
  const { localOrders: orders } = useOrders();
  const { athletes } = useAthletes();
  const { staff } = useStaff();
  const { isLead, assignedSet } = useSportsAccess();
  const { activeSport } = useActiveSport();

  // Sport-scope helper — matches filterBySports (role access, then narrowed to
  // whatever sport is picked in the header) so the bell/badges always reflect
  // the same sport the rest of the app is currently showing.
  const inScope = useMemo(
    () => (sports: string[]) => {
      const roleOk = isLead || sports.some((s) => assignedSet.has(s));
      if (!roleOk) return false;
      return activeSport === 'All Sports' || sports.includes(activeSport);
    },
    [isLead, assignedSet, activeSport]
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

  const recertsDue = useMemo<RecertDue[]>(() => {
    const result: RecertDue[] = [];
    for (const item of inventoryItems) {
      if (!item.recertification || !inScope(item.sports)) continue;
      for (const unit of item.recertification.units) {
        const status = recertStatus(unit, item.recertification);
        if (status === 'ok') continue;
        result.push({
          key: `recert-${item.id}-${unit.serialNumber}`,
          itemId: item.id,
          serialNumber: unit.serialNumber,
          description: item.description,
          sports: item.sports,
          status,
          dueDate: recertDueDate(unit, item.recertification).toISOString().slice(0, 10),
        });
      }
    }
    return result.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [inventoryItems, inScope]);

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

  const count = overdueReturns.length + lowInventory.length + ordersForApproval.length + recertsDue.length;

  return { overdueReturns, lowInventory, ordersForApproval, recertsDue, recentTransactions, count };
}
