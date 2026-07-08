import { createContext, useContext, useState, type ReactNode } from 'react';
import type { StaffMember, IssuedItem } from '../data/types';
import { staffMembers as mockStaff } from '../data/mock/staff';

interface StaffContextValue {
  staff: StaffMember[];
  addStaff: (member: StaffMember) => void;
  issueToStaff: (staffId: string, item: IssuedItem) => void;
  returnFromStaff: (staffId: string, itemId: string) => void;
}

const StaffContext = createContext<StaffContextValue | null>(null);

export function StaffProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<StaffMember[]>([...mockStaff]);

  function addStaff(member: StaffMember) {
    setStaff((prev) => [member, ...prev]);
  }

  function issueToStaff(staffId: string, item: IssuedItem) {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === staffId
          ? { ...s, issuedItems: [item, ...s.issuedItems] }
          : s
      )
    );
  }

  function returnFromStaff(staffId: string, itemId: string) {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === staffId
          ? {
              ...s,
              issuedItems: s.issuedItems.map((i) =>
                i.itemId === itemId ? { ...i, returned: true } : i
              ),
            }
          : s
      )
    );
  }

  return (
    <StaffContext.Provider value={{ staff, addStaff, issueToStaff, returnFromStaff }}>
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error('useStaff must be used within StaffProvider');
  return ctx;
}
