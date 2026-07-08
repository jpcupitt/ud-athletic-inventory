import { useMemo } from 'react';
import { transactions } from '../data/mock/transactions';
import { useInventory } from '../context/InventoryContext';
import { useOrders } from '../context/OrdersContext';
import { useAthletes } from '../context/AthletesContext';
import { useStaff } from '../context/StaffContext';

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
  const { staff: staffMembers } = useStaff();
  const today = new Date();

  const overdueReturns = useMemo<OverdueReturn[]>(() => {
    const result: OverdueReturn[] = [];
    for (const person of athletes) {
      for (const item of person.issuedItems) {
        if (item.isNonExpendable && !item.returned && item.returnByDate) {
          if (new Date(item.returnByDate) < today) {
            result.push({
              key: `overdue-${person.id}-${item.itemId}`,
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
    for (const person of staffMembers) {
      for (const item of person.issuedItems) {
        if (item.isNonExpendable && !item.returned && item.returnByDate) {
          if (new Date(item.returnByDate) < today) {
            result.push({
              key: `overdue-${person.id}-${item.itemId}`,
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
  }, [athletes, staffMembers]);

  const lowInventory = useMemo<LowInventoryItem[]>(
    () => inventoryItems
      .filter((i) => i.qtyOnHand < 3)
      .map((i) => ({ key: `low-${i.id}`, id: i.id, description: i.description, qtyOnHand: i.qtyOnHand })),
    [inventoryItems]
  );

  const ordersForApproval = useMemo<PendingOrder[]>(() => {
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return orders
      .filter((o) => o.status === 'incomplete' && new Date(o.orderDate) >= oneWeekAgo)
      .map((o) => ({ key: `order-${o.id}`, id: o.id, refNumber: o.refNumber, sport: o.sport, vendor: o.vendor }));
  }, [orders]);

  const recentTransactions = useMemo(
    () => [...transactions].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 10),
    []
  );

  const count = overdueReturns.length + lowInventory.length + ordersForApproval.length;

  return { overdueReturns, lowInventory, ordersForApproval, recentTransactions, count };
}
