import { createContext, useContext, useState, type ReactNode } from 'react';
import type { InventoryItem } from '../data/types';
import { inventoryItems as mockItems } from '../data/mock/inventory';

interface InventoryContextValue {
  items: InventoryItem[];
  archivedIds: Set<string>;
  addItem: (item: InventoryItem) => void;
  archiveItems: (ids: Set<string>) => void;
  issueItem: (itemId: string, qty: number) => void;
  returnItem: (itemId: string, qty: number) => void;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([...mockItems]);
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());

  function addItem(item: InventoryItem) {
    setItems((prev) => [item, ...prev]);
  }

  function archiveItems(ids: Set<string>) {
    setArchivedIds((prev) => new Set([...prev, ...ids]));
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

  return (
    <InventoryContext.Provider value={{ items, archivedIds, addItem, archiveItems, issueItem, returnItem }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}
