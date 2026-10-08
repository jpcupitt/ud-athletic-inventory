import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { StaffMember, IssuedItem } from '../data/types';
import { staffMembers as mockStaff } from '../data/mock/staff';
import { usePersistentState } from '../hooks/usePersistentState';

const mockStaffById = new Map(mockStaff.map((s) => [s.id, s]));

interface StaffContextValue {
  staff: StaffMember[];
  addStaff: (member: StaffMember) => void;
  issueToStaff: (staffId: string, item: IssuedItem) => void;
  returnFromStaff: (staffId: string, itemId: string) => void;
}

const StaffContext = createContext<StaffContextValue | null>(null);

export function StaffProvider({ children }: { children: ReactNode }) {
  const [staffRaw, setStaff] = usePersistentState<StaffMember[]>('staff', () => [...mockStaff]);

  // A returning browser's persisted copy can predate a mock-data refresh (new
  // ID scheme, new photos). Forward-sync those two identity fields from the
  // current seed on every load, for any record this app itself seeded —
  // user-added staff (not in mockStaff) are left untouched.
  const staff = useMemo(() => staffRaw.map((s) => {
    const seed = mockStaffById.get(s.id);
    if (!seed) return s;
    if (seed.staffId === s.staffId && seed.photoUrl === s.photoUrl) return s;
    return { ...s, staffId: seed.staffId, photoUrl: seed.photoUrl };
  }), [staffRaw]);

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
