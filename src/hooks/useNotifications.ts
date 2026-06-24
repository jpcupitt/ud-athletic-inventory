import { useMemo } from 'react';
import { transactions } from '../data/mock/transactions';
import { inventoryItems } from '../data/mock/inventory';
import { orders } from '../data/mock/orders';
import { athletes } from '../data/mock/athletes';
import { staffMembers } from '../data/mock/staff';

export function useNotifications() {
  const today = new Date();

  const overdueReturns = useMemo(() => {
    const allPeople = [...athletes, ...staffMembers];
    const overdue: { personName: string; description: string; returnByDate: string }[] = [];
    for (const person of allPeople) {
      for (const item of person.issuedItems) {
        if (item.isNonExpendable && !item.returned && item.returnByDate) {
          if (new Date(item.returnByDate) < today) {
            overdue.push({
              personName: `${person.lastName}, ${person.firstName}`,
              description: item.description,
              returnByDate: item.returnByDate,
            });
          }
        }
      }
    }
    return overdue;
  }, []);

  const lowInventory = useMemo(
    () => inventoryItems.filter((i) => i.qtyOnHand < 3),
    []
  );

  const ordersForApproval = useMemo(
    () => orders.filter((o) => o.status === 'submitted'),
    []
  );

  const recentTransactions = useMemo(
    () => [...transactions].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 10),
    []
  );

  const count = overdueReturns.length + lowInventory.length + ordersForApproval.length;

  return { overdueReturns, lowInventory, ordersForApproval, recentTransactions, count };
}
