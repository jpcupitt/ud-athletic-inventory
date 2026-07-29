import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { InventoryItem } from '../data/types';
import { inventoryItems as mockItems } from '../data/mock/inventory';
import { usePersistentState } from '../hooks/usePersistentState';

interface InventoryContextValue {
  items: InventoryItem[];
  archivedIds: Set<string>;
  addItem: (item: InventoryItem) => void;
  archiveItems: (ids: Set<string>) => void;
  unarchiveItems: (ids: string[]) => void;
  issueItem: (itemId: string, qty: number) => void;
  returnItem: (itemId: string, qty: number) => void;
  addOnOrder: (itemId: string, qty: number) => void;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = usePersistentState<InventoryItem[]>('inventory', () => [...mockItems]);
  const [archivedArr, setArchivedArr] = usePersistentState<string[]>('archived', () => []);
  const archivedIds = useMemo(() => new Set(archivedArr), [archivedArr]);

  function addItem(item: InventoryItem) {
    setItems((prev) => [item, ...prev]);
  }

  function archiveItems(ids: Set<string>) {
    setArchivedArr((prev) => [...new Set([...prev, ...ids])]);
  }

  function unarchiveItems(ids: string[]) {
    setArchivedArr((prev) => prev.filter((id) => !ids.includes(id)));
  }

  function issueItem(itemId: string, qty: number) {
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId ? { ...it, qtyOnHand: Math.max(0, it.qtyOnHand - qty) } : it
      )
    );
  }

  function returnItem(itemId: string, qty: number) {
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId ? { ...it, qtyOnHand: it.qtyOnHand + qty } : it
      )
    );
  }

  function addOnOrder(itemId: string, qty: number) {
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId ? { ...it, qtyOnOrder: it.qtyOnOrder + qty } : it
      )
    );
  }

  return (
    <InventoryContext.Provider value={{ items, archivedIds, addItem, archiveItems, unarchiveItems, issueItem, returnItem, addOnOrder }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}
