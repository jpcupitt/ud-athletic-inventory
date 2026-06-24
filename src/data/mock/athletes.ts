import type { Athlete } from '../types';

export const athletes: Athlete[] = [
  // Men's Basketball
  {
    id: 'a1', athleteId: 'MBB001', firstName: 'Jyare', lastName: 'Davis',
    barcode: 'MBB2026001', sports: ["Basketball, Men's"], year: 'Junior',
    notes: "Jersey #1. Prefers size L tops, M shorts. Game shoes: Adidas Harden Vol. 8 size 13.",
    issuedItems: [
      { itemId: 'inv-001', description: 'Pregame SS Tee ROYAL', qty: 2, pricePerUnit: 25.0, issuedDate: '2026-06-01', isNonExpendable: false, returned: false },
      { itemId: 'inv-003', description: 'Practice Shorts NAVY', qty: 2, pricePerUnit: 30.0, issuedDate: '2026-06-01', isNonExpendable: false, returned: false },
      { itemId: 'inv-005', description: 'ZNE Hoodie NAVY', qty: 1, pricePerUnit: 65.0, issuedDate: '2026-06-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a2', athleteId: 'MBB002', firstName: 'Dylan', lastName: 'Sherwood',
    barcode: 'MBB2026002', sports: ["Basketball, Men's"], year: 'Senior',
    notes: "Jersey #3. Size XL tops, L shorts. Needs extra warm-up gear for cold arenas.",
    issuedItems: [
      { itemId: 'inv-001', description: 'Pregame SS Tee ROYAL', qty: 2, pricePerUnit: 25.0, issuedDate: '2026-06-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a3', athleteId: 'MBB003', firstName: 'Kahlil', lastName: 'Whitney',
    barcode: 'MBB2026003', sports: ["Basketball, Men's"], year: 'Sophomore',
    notes: "Jersey #5. Size M tops and shorts.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a4', athleteId: 'MBB004', firstName: 'Cavan', lastName: 'Reilly',
    barcode: 'MBB2026004', sports: ["Basketball, Men's"], year: 'Junior',
    notes: '',
    issuedItems: [
      { itemId: 'inv-002', description: 'Pregame LS Tee ROYAL', qty: 2, pricePerUnit: 28.0, issuedDate: '2026-06-02', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  // Women's Basketball
  {
    id: 'a5', athleteId: 'WBB001', firstName: 'Destiny', lastName: 'Adams',
    barcode: 'WBB2026001', sports: ["Basketball, Women's"], year: 'Senior',
    notes: "Jersey #10. Size S tops, S shorts. Captain.",
    issuedItems: [
      { itemId: 'inv-001', description: 'Pregame SS Tee ROYAL', qty: 2, pricePerUnit: 25.0, issuedDate: '2026-06-03', isNonExpendable: false, returned: false },
      { itemId: 'inv-006', description: 'Game Jersey HOME', qty: 1, pricePerUnit: 75.0, issuedDate: '2026-06-03', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a6', athleteId: 'WBB002', firstName: 'Jasmine', lastName: 'Dickey',
    barcode: 'WBB2026002', sports: ["Basketball, Women's"], year: 'Junior',
    notes: "Jersey #12. Size M. Left-handed.",
    issuedItems: [],
    photoUrl: undefined,
  },
  // Baseball
  {
    id: 'a7', athleteId: 'BASE001', firstName: 'Ethan', lastName: 'Rogers',
    barcode: 'BASE2026001', sports: ['Baseball'], year: 'Junior',
    notes: "Left-handed hitter. Uses C-flap helmet. Arm guard on right arm. Batting gloves size L. Bat: Marucci CAT9 31oz.",
    issuedItems: [
      { itemId: 'inv-020', description: 'BP Jersey BLUE', qty: 2, pricePerUnit: 45.0, issuedDate: '2026-02-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a8', athleteId: 'BASE002', firstName: 'Connor', lastName: 'Hughes',
    barcode: 'BASE2026002', sports: ['Baseball'], year: 'Senior',
    notes: "Right-handed pitcher. Batting gloves size M. Batting helmet size 7 1/4.",
    issuedItems: [],
    photoUrl: undefined,
  },
  // Football
  {
    id: 'a9', athleteId: 'FB001', firstName: 'Marcus', lastName: 'Webb',
    barcode: 'FB2026001', sports: ['Football'], year: 'Senior',
    notes: "QB. Jersey #7. Wears 2XL game jersey, XL practice. Helmet size L – Riddell SpeedFlex.",
    issuedItems: [
      { itemId: 'inv-010', description: 'Riddell SpeedFlex Helmet', qty: 1, pricePerUnit: 350.0, issuedDate: '2026-08-01', isNonExpendable: true, returnByDate: '2027-01-15', returned: false },
      { itemId: 'inv-011', description: 'Game Jersey HOME', qty: 1, pricePerUnit: 120.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a10', athleteId: 'FB002', firstName: 'Darius', lastName: 'Thompson',
    barcode: 'FB2026002', sports: ['Football'], year: 'Junior',
    notes: "WR. Jersey #11. Helmet size M. Gloves: Cutters size L.",
    issuedItems: [
      { itemId: 'inv-010', description: 'Riddell SpeedFlex Helmet', qty: 1, pricePerUnit: 350.0, issuedDate: '2026-08-01', isNonExpendable: true, returnByDate: '2027-01-15', returned: false },
    ],
    photoUrl: undefined,
  },
  // Field Hockey
  {
    id: 'a11', athleteId: 'FH001', firstName: 'Sophie', lastName: 'Clarke',
    barcode: 'FH2026001', sports: ['Field Hockey'], year: 'Senior',
    notes: "Captain. Stick: Adidas TX Carbon 70% 36in. Shin guards size M.",
    issuedItems: [
      { itemId: 'inv-030', description: 'Winter Travel Jacket NAVY', qty: 1, pricePerUnit: 110.0, issuedDate: '2026-09-01', isNonExpendable: true, returnByDate: '2026-12-15', returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a12', athleteId: 'FH002', firstName: 'Nadia', lastName: 'Osei',
    barcode: 'FH2026002', sports: ['Field Hockey'], year: 'Sophomore',
    notes: "Stick: Grays GX7000 37in. Left-handed. Goalkeeper backup.",
    issuedItems: [
      { itemId: 'inv-030', description: 'Winter Travel Jacket NAVY', qty: 1, pricePerUnit: 110.0, issuedDate: '2026-09-01', isNonExpendable: true, returnByDate: '2026-12-15', returned: false },
    ],
    photoUrl: undefined,
  },
  // Tennis
  {
    id: 'a13', athleteId: 'MTEN001', firstName: 'Alex', lastName: 'Nguyen',
    barcode: 'MTEN2026001', sports: ["Tennis, Men's"], year: 'Junior',
    notes: "Racket: Wilson Blade 98 v8, grip size 4 3/8. Strings: Luxilon ALU Power 1.25mm. Prefers clay-court shoes.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a14', athleteId: 'WTEN001', firstName: 'Emma', lastName: 'Petrov',
    barcode: 'WTEN2026001', sports: ["Tennis, Women's"], year: 'Senior',
    notes: "Racket: Babolat Pure Drive 2021, grip size 4 1/4. Strings: RPM Blast 1.30mm.",
    issuedItems: [],
    photoUrl: undefined,
  },
  // Softball
  {
    id: 'a15', athleteId: 'SB001', firstName: 'Kayla', lastName: 'Martinez',
    barcode: 'SB2026001', sports: ['Softball'], year: 'Senior',
    notes: "Pitcher. Right-handed. Glove: Wilson A2000 fastpitch 12in.",
    issuedItems: [
      { itemId: 'inv-031', description: 'Winter Travel Jacket NAVY', qty: 1, pricePerUnit: 110.0, issuedDate: '2026-09-05', isNonExpendable: true, returnByDate: '2026-12-15', returned: false },
    ],
    photoUrl: undefined,
  },
  // Soccer Men's
  {
    id: 'a16', athleteId: 'MSOC001', firstName: 'Luca', lastName: 'Ferraro',
    barcode: 'MSOC2026001', sports: ["Soccer, Men's"], year: 'Junior',
    notes: "GK. Gloves: Reusch Attrakt G3 size 10. Jersey #1.",
    issuedItems: [],
    photoUrl: undefined,
  },
  // Soccer Women's
  {
    id: 'a17', athleteId: 'WSOC001', firstName: 'Brianna', lastName: 'Cole',
    barcode: 'WSOC2026001', sports: ["Soccer, Women's"], year: 'Sophomore',
    notes: "Forward. Jersey #9. Size S tops.",
    issuedItems: [],
    photoUrl: undefined,
  },
  // Lacrosse Men's
  {
    id: 'a18', athleteId: 'MLAX001', firstName: 'Tyler', lastName: 'Simmons',
    barcode: 'MLAX2026001', sports: ["Lacrosse, Men's"], year: 'Senior',
    notes: "Attack. Shaft: ECD Carbon Pro 2.0. Head: STX Stallion 900.",
    issuedItems: [],
    photoUrl: undefined,
  },
  // Lacrosse Women's
  {
    id: 'a19', athleteId: 'WLAX001', firstName: 'Chloe', lastName: 'Burns',
    barcode: 'WLAX2026001', sports: ["Lacrosse, Women's"], year: 'Junior',
    notes: "Midfield. Goggles: STX 4Sight+ size S.",
    issuedItems: [],
    photoUrl: undefined,
  },
  // Volleyball
  {
    id: 'a20', athleteId: 'VB001', firstName: 'Mia', lastName: 'Hansen',
    barcode: 'VB2026001', sports: ['Volleyball'], year: 'Senior',
    notes: "Setter. Jersey #7. Knee pads size M. Shoes: Mizuno Wave Lightning Z7 size 9.",
    issuedItems: [],
    photoUrl: undefined,
  },
];
