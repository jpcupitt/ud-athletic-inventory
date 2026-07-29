export type Sport =
  | 'Baseball'
  | "Basketball, Men's"
  | "Basketball, Women's"
  | 'Cross Country'
  | 'Field Hockey'
  | "Golf, Men's"
  | "Golf, Women's"
  | 'Ice Hockey'
  | "Lacrosse, Men's"
  | "Lacrosse, Women's"
  | 'Rowing'
  | "Soccer, Men's"
  | "Soccer, Women's"
  | 'Softball'
  | "Swimming & Diving, Men's"
  | "Swimming & Diving, Women's"
  | "Tennis, Men's"
  | "Tennis, Women's"
  | 'Track & Field, Indoor'
  | 'Track & Field, Outdoor'
  | 'Volleyball'
  | 'Football';

export type ItemCategory =
  | 'Top'
  | 'Bottom'
  | 'Outerwear'
  | 'Footwear'
  | 'Headwear'
  | 'Equipment'
  | 'Bag'
  | 'Accessory';

export type OrderStatus = 'submitted' | 'incomplete' | 'complete';

export type TransactionType = 'issue' | 'return';

export type DashboardWidget =
  | 'inventory-chart'
  | 'transaction-history'
  | 'returns-tracker'
  | 'notifications';

// ── Inventory ──────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  itemId: string;
  description: string;
  category: ItemCategory;
  unit: string;
  year: string;
  manufacturer: string;
  model: string;
  pricePerUnit: number;
  photoUrl?: string;
  sports: Sport[];
  isNonExpendable: boolean;
  returnByDate?: string;
  qtyOnHand: number;
  qtyOnOrder: number;
  isSerialized: boolean;
  serialNumbers?: string[];
  notes?: string;
}

// ── People ──────────────────────────────────────────────────

export interface IssuedItem {
  /** Unique per-issuance identity. Lets Return Day resolve exactly one row even
   *  when the same item was issued to the same person more than once. Optional so
   *  legacy/seed rows without it still work (resolvers fall back to first-match). */
  issueId?: string;
  itemId: string;
  description: string;
  qty: number;
  pricePerUnit: number;
  issuedDate: string;
  isNonExpendable: boolean;
  returnByDate?: string;
  returned: boolean;
  /** Set on Return Day: how the item was closed out. Missing/damaged feed the owes list. */
  resolution?: 'returned' | 'missing' | 'damaged';
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  barcode: string;
  sports: Sport[];
  photoUrl?: string;
  notes: string;
  issuedItems: IssuedItem[];
}

export interface CustomSizeEntry {
  id: string;
  label: string;
  value: string;
}

export interface Athlete extends Person {
  athleteId: string;
  year: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Graduate';
  shirtSize?: string;
  shortsSize?: string;
  shoeSize?: string;
  /** Manager-defined size chart — any item name paired with a size, e.g. "Helmet" -> "L". */
  customSizes?: CustomSizeEntry[];
}

export interface StaffMember extends Person {
  staffId: string;
  title: string;
  locker?: string;
  shirtSize?: string;
  shortsSize?: string;
  shoeSize?: string;
}

// ── Orders ──────────────────────────────────────────────────

export interface OrderLine {
  description: string;
  qtyOrdered: number;
  qtyReceived: number;
}

export interface Order {
  id: string;
  refNumber: string;
  orderDate: string;
  vendor: string;
  sport: Sport;
  lines: OrderLine[];
  status: OrderStatus;
  createdBy: string;
}

// ── Transactions ─────────────────────────────────────────────

export interface TransactionItem {
  itemId: string;
  description: string;
  qty: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  personId: string;
  personName: string;
  sport: Sport;
  items: TransactionItem[];
  timestamp: string;
  createdBy: string;
}

// ── Vendors ──────────────────────────────────────────────────

export interface Vendor {
  id: string;
  name: string;
}

// ── User / Auth ──────────────────────────────────────────────

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'viewer';
  isLead: boolean;
  assignedSports: Sport[];
}

export interface UserPrefs {
  userId: string;
  widgets: DashboardWidget[];
}
