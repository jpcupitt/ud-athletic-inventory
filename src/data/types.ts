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

export interface RecertUnit {
  serialNumber: string;
  /** ISO date of the unit's last NOCSAE recertification/reconditioning. */
  lastCertifiedDate: string;
}

export interface RecertPolicy {
  /** How often each unit must be sent out for recertification. */
  intervalMonths: number;
  units: RecertUnit[];
}

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
  /** Present only for equipment subject to recertification, e.g. football/lacrosse helmets. */
  recertification?: RecertPolicy;
  /** On-hand count broken out by size, e.g. { M: 12, L: 20 }. When present, the sum
   *  always equals qtyOnHand — qtyOnHand stays the source of truth for totals/charts. */
  sizeBreakdown?: Record<string, number>;
  /** Set when the item has been moved to the Spring Sale — independent of the item's
   *  real cost (pricePerUnit), which is never touched by sale pricing. */
  springSale?: { salePrice: number };
  /** When set, only athletes whose `position` is in this list are offered the item
   *  when issuing — e.g. kicking cleats shouldn't show up for a lineman. Unset (the
   *  default) means everyone on the sport can be issued it. */
  positions?: string[];
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
  /** e.g. "Kicker", "Long Stick Midfield", "Goalie" — drives which gear is offered. */
  position?: string;
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
  /** Optional size breakdown of qtyOrdered, e.g. { S: 10, M: 20, L: 15 }. */
  sizeBreakdown?: Record<string, number>;
}

export interface Order {
  id: string;
  /** The vendor's own order/sales-order number from the confirmation — what you'd
   *  search by to look the order up with the vendor. Falls back to a generated
   *  id (order title + date) when a PDF confirmation doesn't have one yet. */
  orderNumber: string;
  /** PO number (was "Reference Number"). Defaults to "<title> — <date>" when
   *  there's no real PO, since most of these orders don't have one. */
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
  role: 'manager' | 'student_manager' | 'viewer';
  isLead: boolean;
  assignedSports: Sport[];
  /** Sports this user is explicitly blocked from, even if isLead would otherwise
   *  grant access to everything — e.g. a student manager who sees every sport
   *  except football (quantities, names issued-to, and costs all excluded). */
  excludedSports?: Sport[];
}

export interface UserPrefs {
  userId: string;
  widgets: DashboardWidget[];
}
