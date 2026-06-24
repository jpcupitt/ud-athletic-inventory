import type { InventoryItem } from '../types';

export const inventoryItems: InventoryItem[] = [
  // Tops
  {
    id: 'inv-001', itemId: '1259742', description: 'Pregame SS Tee ROYAL',
    category: 'Top', unit: 'Each', year: '2026-27', manufacturer: 'Adidas', model: 'JX4456',
    pricePerUnit: 25.0, sports: ["Basketball, Men's", "Basketball, Women's"],
    isNonExpendable: false, qtyOnHand: 7, qtyOnOrder: 0, isSerialized: false,
    photoUrl: undefined,
  },
  {
    id: 'inv-002', itemId: '1259746', description: 'Pregame LS Tee ROYAL',
    category: 'Top', unit: 'Each', year: '2026-27', manufacturer: 'Adidas', model: 'JX4481',
    pricePerUnit: 28.0, sports: ["Basketball, Men's", "Basketball, Women's"],
    isNonExpendable: false, qtyOnHand: 9, qtyOnOrder: 0, isSerialized: false,
    photoUrl: undefined,
  },
  {
    id: 'inv-003', itemId: '1259760', description: 'Practice Shorts NAVY',
    category: 'Bottom', unit: 'Each', year: '2026-27', manufacturer: 'Adidas', model: 'JX4500',
    pricePerUnit: 30.0, sports: ["Basketball, Men's", "Basketball, Women's"],
    isNonExpendable: false, qtyOnHand: 14, qtyOnOrder: 0, isSerialized: false,
    photoUrl: undefined,
  },
  {
    id: 'inv-004', itemId: '1259755', description: 'Pregame SS Tee WHITE',
    category: 'Top', unit: 'Each', year: '2026-27', manufacturer: 'Adidas', model: 'JX4467',
    pricePerUnit: 25.0, sports: ["Basketball, Men's", "Basketball, Women's"],
    isNonExpendable: false, qtyOnHand: 7, qtyOnOrder: 0, isSerialized: false,
    photoUrl: undefined,
  },
  {
    id: 'inv-005', itemId: '1259800', description: 'ZNE Hoodie NAVY',
    category: 'Top', unit: 'Each', year: '2026-27', manufacturer: 'Adidas', model: 'JX4600',
    pricePerUnit: 65.0, sports: ["Basketball, Men's"],
    isNonExpendable: false, qtyOnHand: 5, qtyOnOrder: 58, isSerialized: false,
    photoUrl: undefined,
  },
  {
    id: 'inv-006', itemId: '1259810', description: 'Game Jersey HOME',
    category: 'Top', unit: 'Each', year: '2026-27', manufacturer: 'Adidas', model: 'JX4700',
    pricePerUnit: 75.0, sports: ["Basketball, Women's"],
    isNonExpendable: false, qtyOnHand: 15, qtyOnOrder: 0, isSerialized: false,
    photoUrl: undefined,
  },
  // Outerwear
  {
    id: 'inv-007', itemId: '1259820', description: 'Travel Jacket NAVY',
    category: 'Outerwear', unit: 'Each', year: '2026-27', manufacturer: 'Adidas', model: 'JX4800',
    pricePerUnit: 95.0, sports: ["Basketball, Men's", "Basketball, Women's"],
    isNonExpendable: false, qtyOnHand: 20, qtyOnOrder: 0, isSerialized: false,
    photoUrl: undefined,
  },
  {
    id: 'inv-008', itemId: '1259821', description: 'Game n Go Jacket BLACK/GREY',
    category: 'Outerwear', unit: 'Each', year: '2026-27', manufacturer: 'Adidas', model: 'JX4820',
    pricePerUnit: 88.0, sports: ["Basketball, Men's"],
    isNonExpendable: false, qtyOnHand: 57, qtyOnOrder: 57, isSerialized: false,
    photoUrl: undefined,
  },
  // Footwear
  {
    id: 'inv-009', itemId: '1259830', description: 'Workout Sneaker WHITE',
    category: 'Footwear', unit: 'Each', year: '2026-27', manufacturer: 'Adidas', model: 'JX4900',
    pricePerUnit: 110.0, sports: ["Basketball, Men's"],
    isNonExpendable: false, qtyOnHand: 15, qtyOnOrder: 0, isSerialized: false,
    photoUrl: undefined,
  },
  // Football - Serialized
  {
    id: 'inv-010', itemId: 'FB-H001', description: 'Riddell SpeedFlex Helmet',
    category: 'Equipment', unit: 'Each', year: '2026-27', manufacturer: 'Riddell', model: 'SpeedFlex',
    pricePerUnit: 350.0, sports: ['Football'],
    isNonExpendable: true, returnByDate: '2027-01-15',
    qtyOnHand: 85, qtyOnOrder: 0, isSerialized: true,
    serialNumbers: ['RSF-001', 'RSF-002', 'RSF-003', 'RSF-004', 'RSF-005'],
    photoUrl: undefined,
  },
  {
    id: 'inv-011', itemId: 'FB-J001', description: 'Game Jersey HOME',
    category: 'Top', unit: 'Each', year: '2026-27', manufacturer: 'Adidas', model: 'FB-HOME',
    pricePerUnit: 120.0, sports: ['Football'],
    isNonExpendable: false, qtyOnHand: 90, qtyOnOrder: 0, isSerialized: false,
    photoUrl: undefined,
  },
  {
    id: 'inv-012', itemId: 'FB-J002', description: 'Game Jersey AWAY',
    category: 'Top', unit: 'Each', year: '2026-27', manufacturer: 'Adidas', model: 'FB-AWAY',
    pricePerUnit: 120.0, sports: ['Football'],
    isNonExpendable: false, qtyOnHand: 90, qtyOnOrder: 0, isSerialized: false,
    photoUrl: undefined,
  },
  {
    id: 'inv-013', itemId: 'FB-P001', description: 'Practice Jersey BLUE',
    category: 'Top', unit: 'Each', year: '2026-27', manufacturer: 'Adidas', model: 'FB-PRAC',
    pricePerUnit: 45.0, sports: ['Football'],
    isNonExpendable: false, qtyOnHand: 120, qtyOnOrder: 0, isSerialized: false,
    photoUrl: undefined,
  },
  // Baseball
  {
    id: 'inv-020', itemId: 'BASE-J001', description: 'BP Jersey BLUE',
    category: 'Top', unit: 'Each', year: '2026-27', manufacturer: 'Adidas', model: 'BASE-BP',
    pricePerUnit: 45.0, sports: ['Baseball'],
    isNonExpendable: false, qtyOnHand: 30, qtyOnOrder: 0, isSerialized: false,
    photoUrl: undefined,
  },
  {
    id: 'inv-021', itemId: 'BASE-J002', description: 'Game Jersey HOME WHITE',
    category: 'Top', unit: 'Each', year: '2026-27', manufacturer: 'Adidas', model: 'BASE-HOME',
    pricePerUnit: 85.0, sports: ['Baseball'],
    isNonExpendable: false, qtyOnHand: 25, qtyOnOrder: 0, isSerialized: false,
    photoUrl: undefined,
  },
  {
    id: 'inv-022', itemId: 'BASE-B001', description: 'Batting Helmet C-Flap LEFT',
    category: 'Equipment', unit: 'Each', year: '2026-27', manufacturer: 'Rawlings', model: 'MACH-CFL',
    pricePerUnit: 65.0, sports: ['Baseball'],
    isNonExpendable: false, qtyOnHand: 8, qtyOnOrder: 0, isSerialized: false,
    photoUrl: undefined,
  },
  // Field Hockey
  {
    id: 'inv-030', itemId: 'FH-J001', description: 'Winter Travel Jacket NAVY',
    category: 'Outerwear', unit: 'Each', year: '2026-27', manufacturer: 'Adidas', model: 'FH-WJ',
    pricePerUnit: 110.0, sports: ['Field Hockey'],
    isNonExpendable: true, returnByDate: '2026-12-15',
    qtyOnHand: 22, qtyOnOrder: 0, isSerialized: false,
    photoUrl: undefined,
  },
  {
    id: 'inv-031', itemId: 'SB-J001', description: 'Winter Travel Jacket NAVY',
    category: 'Outerwear', unit: 'Each', year: '2026-27', manufacturer: 'Adidas', model: 'SB-WJ',
    pricePerUnit: 110.0, sports: ['Softball'],
    isNonExpendable: true, returnByDate: '2026-12-15',
    qtyOnHand: 18, qtyOnOrder: 0, isSerialized: false,
    photoUrl: undefined,
  },
  // Lacrosse Men's
  {
    id: 'inv-040', itemId: 'MLAX-J001', description: 'Game Jersey HOME BLUE',
    category: 'Top', unit: 'Each', year: '2026-27', manufacturer: 'Adidas', model: 'MLAX-HOME',
    pricePerUnit: 80.0, sports: ["Lacrosse, Men's"],
    isNonExpendable: false, qtyOnHand: 30, qtyOnOrder: 0, isSerialized: false,
    photoUrl: undefined,
  },
  {
    id: 'inv-041', itemId: 'MLAX-H001', description: 'Cascade XRS Lacrosse Helmet',
    category: 'Equipment', unit: 'Each', year: '2026-27', manufacturer: 'Cascade', model: 'XRS',
    pricePerUnit: 280.0, sports: ["Lacrosse, Men's"],
    isNonExpendable: true, returnByDate: '2027-05-15',
    qtyOnHand: 32, qtyOnOrder: 0, isSerialized: true,
    photoUrl: undefined,
  },
  // Tennis
  {
    id: 'inv-050', itemId: 'TEN-S001', description: 'Match Polo BLUE',
    category: 'Top', unit: 'Each', year: '2026-27', manufacturer: 'Adidas', model: 'TEN-POLO',
    pricePerUnit: 55.0, sports: ["Tennis, Men's", "Tennis, Women's"],
    isNonExpendable: false, qtyOnHand: 16, qtyOnOrder: 0, isSerialized: false,
    photoUrl: undefined,
  },
  // Swimming
  {
    id: 'inv-060', itemId: 'SWIM-S001', description: 'Parka Jacket NAVY',
    category: 'Outerwear', unit: 'Each', year: '2026-27', manufacturer: 'TYR', model: 'PARKA-UD',
    pricePerUnit: 130.0, sports: ["Swimming & Diving, Men's", "Swimming & Diving, Women's"],
    isNonExpendable: false, qtyOnHand: 40, qtyOnOrder: 0, isSerialized: false,
    photoUrl: undefined,
  },
  // Volleyball
  {
    id: 'inv-070', itemId: 'VB-J001', description: 'Game Jersey HOME WHITE',
    category: 'Top', unit: 'Each', year: '2026-27', manufacturer: 'Adidas', model: 'VB-HOME',
    pricePerUnit: 70.0, sports: ['Volleyball'],
    isNonExpendable: false, qtyOnHand: 14, qtyOnOrder: 0, isSerialized: false,
    photoUrl: undefined,
  },
  // Soccer
  {
    id: 'inv-080', itemId: 'SOC-J001', description: 'Game Jersey HOME BLUE',
    category: 'Top', unit: 'Each', year: '2026-27', manufacturer: 'Adidas', model: 'SOC-HOME',
    pricePerUnit: 65.0, sports: ["Soccer, Men's", "Soccer, Women's"],
    isNonExpendable: false, qtyOnHand: 50, qtyOnOrder: 0, isSerialized: false,
    photoUrl: undefined,
  },
  // Bags
  {
    id: 'inv-090', itemId: 'BAG-001', description: 'Team Duffel Bag NAVY',
    category: 'Bag', unit: 'Each', year: '2026-27', manufacturer: 'Adidas', model: 'DUFL-UD',
    pricePerUnit: 55.0, sports: ["Basketball, Men's", "Basketball, Women's", 'Baseball', 'Football', 'Field Hockey', 'Softball'],
    isNonExpendable: false, qtyOnHand: 85, qtyOnOrder: 0, isSerialized: false,
    photoUrl: undefined,
  },
];
