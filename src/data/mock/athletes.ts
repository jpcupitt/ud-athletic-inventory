import type { Athlete } from '../types';

export const athletes: Athlete[] = [
  // ── Men's Basketball (15 players) ──────────────────────────
  {
    id: 'a1', athleteId: 'MBB001', firstName: 'Alex', lastName: 'Rivera',
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
    id: 'a2', athleteId: 'MBB002', firstName: 'Jordan', lastName: 'Chen',
    barcode: 'MBB2026002', sports: ["Basketball, Men's"], year: 'Senior',
    notes: "Jersey #3. Size XL tops, L shorts. Needs extra warm-up gear for cold arenas.",
    issuedItems: [
      { itemId: 'inv-001', description: 'Pregame SS Tee ROYAL', qty: 2, pricePerUnit: 25.0, issuedDate: '2026-06-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a3', athleteId: 'MBB003', firstName: 'Sam', lastName: 'Taylor',
    barcode: 'MBB2026003', sports: ["Basketball, Men's"], year: 'Sophomore',
    notes: "Jersey #5. Size M tops and shorts.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a4', athleteId: 'MBB004', firstName: 'Casey', lastName: 'Morgan',
    barcode: 'MBB2026004', sports: ["Basketball, Men's"], year: 'Junior',
    notes: "Jersey #0. Size L tops, M shorts. Prefers compression tights under shorts.",
    issuedItems: [
      { itemId: 'inv-002', description: 'Pregame LS Tee ROYAL', qty: 2, pricePerUnit: 28.0, issuedDate: '2026-06-02', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a21', athleteId: 'MBB005', firstName: 'Taylor', lastName: 'Bishop',
    barcode: 'MBB2026005', sports: ["Basketball, Men's"], year: 'Freshman',
    notes: "Jersey #2. Size L tops, L shorts. High-top shoes only — Nike LeBron 21 size 14.",
    issuedItems: [
      { itemId: 'inv-001', description: 'Pregame SS Tee ROYAL', qty: 2, pricePerUnit: 25.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
      { itemId: 'inv-003', description: 'Practice Shorts NAVY', qty: 1, pricePerUnit: 30.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a22', athleteId: 'MBB006', firstName: 'Morgan', lastName: 'Carson',
    barcode: 'MBB2026006', sports: ["Basketball, Men's"], year: 'Senior',
    notes: "Jersey #21. Size XL tops, XL shorts. Graduate transfer. Knee sleeve left leg.",
    issuedItems: [
      { itemId: 'inv-005', description: 'ZNE Hoodie NAVY', qty: 1, pricePerUnit: 65.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a23', athleteId: 'MBB007', firstName: 'Jamie', lastName: 'Diaz',
    barcode: 'MBB2026007', sports: ["Basketball, Men's"], year: 'Sophomore',
    notes: "Jersey #4. Size M tops, M shorts. Ankle brace both ankles — needs extra laces.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a24', athleteId: 'MBB008', firstName: 'Riley', lastName: 'Ellison',
    barcode: 'MBB2026008', sports: ["Basketball, Men's"], year: 'Junior',
    notes: "Jersey #11. Size L tops, M shorts. Shooting guard.",
    issuedItems: [
      { itemId: 'inv-001', description: 'Pregame SS Tee ROYAL', qty: 2, pricePerUnit: 25.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
      { itemId: 'inv-004', description: 'Warm-Up Pants NAVY', qty: 1, pricePerUnit: 55.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a25', athleteId: 'MBB009', firstName: 'Quinn', lastName: 'Fowler',
    barcode: 'MBB2026009', sports: ["Basketball, Men's"], year: 'Graduate',
    notes: "Jersey #32. Size 2XL tops, XL shorts. Post player. 5th-year graduate student.",
    issuedItems: [
      { itemId: 'inv-005', description: 'ZNE Hoodie NAVY', qty: 1, pricePerUnit: 65.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
      { itemId: 'inv-003', description: 'Practice Shorts NAVY', qty: 2, pricePerUnit: 30.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a26', athleteId: 'MBB010', firstName: 'Avery', lastName: 'Grant',
    barcode: 'MBB2026010', sports: ["Basketball, Men's"], year: 'Freshman',
    notes: "Jersey #13. Size M tops, M shorts. Walk-on.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a27', athleteId: 'MBB011', firstName: 'Parker', lastName: 'Hale',
    barcode: 'MBB2026011', sports: ["Basketball, Men's"], year: 'Junior',
    notes: "Jersey #22. Size L tops, L shorts. Point guard. Patellar tendon strap right knee.",
    issuedItems: [
      { itemId: 'inv-002', description: 'Pregame LS Tee ROYAL', qty: 1, pricePerUnit: 28.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a28', athleteId: 'MBB012', firstName: 'Reese', lastName: 'Ingram',
    barcode: 'MBB2026012', sports: ["Basketball, Men's"], year: 'Senior',
    notes: "Jersey #15. Size XL tops, L shorts. Transfer from Temple.",
    issuedItems: [
      { itemId: 'inv-001', description: 'Pregame SS Tee ROYAL', qty: 2, pricePerUnit: 25.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a29', athleteId: 'MBB013', firstName: 'Rowan', lastName: 'Jensen',
    barcode: 'MBB2026013', sports: ["Basketball, Men's"], year: 'Sophomore',
    notes: "Jersey #34. Size XL tops, XL shorts. Center.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a30', athleteId: 'MBB014', firstName: 'Skyler', lastName: 'Keller',
    barcode: 'MBB2026014', sports: ["Basketball, Men's"], year: 'Freshman',
    notes: "Jersey #24. Size L tops, M shorts. Recruited from Philly.",
    issuedItems: [
      { itemId: 'inv-003', description: 'Practice Shorts NAVY', qty: 1, pricePerUnit: 30.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a31', athleteId: 'MBB015', firstName: 'Emerson', lastName: 'Lawson',
    barcode: 'MBB2026015', sports: ["Basketball, Men's"], year: 'Graduate',
    notes: "Jersey #44. Size 2XL tops, XL shorts. Graduate transfer (Delaware State). Power forward.",
    issuedItems: [
      { itemId: 'inv-005', description: 'ZNE Hoodie NAVY', qty: 1, pricePerUnit: 65.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
      { itemId: 'inv-004', description: 'Warm-Up Pants NAVY', qty: 1, pricePerUnit: 55.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },

  // ── Women's Basketball (15 players) ────────────────────────
  {
    id: 'a5', athleteId: 'WBB001', firstName: 'Finley', lastName: 'Mercer',
    barcode: 'WBB2026001', sports: ["Basketball, Women's"], year: 'Senior',
    notes: "Jersey #10. Size S tops, S shorts. Captain.",
    issuedItems: [
      { itemId: 'inv-001', description: 'Pregame SS Tee ROYAL', qty: 2, pricePerUnit: 25.0, issuedDate: '2026-06-03', isNonExpendable: false, returned: false },
      { itemId: 'inv-006', description: 'Game Jersey HOME', qty: 1, pricePerUnit: 75.0, issuedDate: '2026-06-03', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a6', athleteId: 'WBB002', firstName: 'Harper', lastName: 'Nash',
    barcode: 'WBB2026002', sports: ["Basketball, Women's"], year: 'Junior',
    notes: "Jersey #12. Size M. Left-handed.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a32', athleteId: 'WBB003', firstName: 'Kendall', lastName: 'Owens',
    barcode: 'WBB2026003', sports: ["Basketball, Women's"], year: 'Sophomore',
    notes: "Jersey #3. Size S tops, S shorts. Point guard. Wrist brace right hand.",
    issuedItems: [
      { itemId: 'inv-001', description: 'Pregame SS Tee ROYAL', qty: 2, pricePerUnit: 25.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a33', athleteId: 'WBB004', firstName: 'Logan', lastName: 'Preston',
    barcode: 'WBB2026004', sports: ["Basketball, Women's"], year: 'Senior',
    notes: "Jersey #21. Size M tops, M shorts. Graduate student. Forward.",
    issuedItems: [
      { itemId: 'inv-005', description: 'ZNE Hoodie NAVY', qty: 1, pricePerUnit: 65.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
      { itemId: 'inv-003', description: 'Practice Shorts NAVY', qty: 2, pricePerUnit: 30.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a34', athleteId: 'WBB005', firstName: 'Micah', lastName: 'Reyes',
    barcode: 'WBB2026005', sports: ["Basketball, Women's"], year: 'Freshman',
    notes: "Jersey #2. Size S tops, S shorts. Highly recruited guard from New Jersey.",
    issuedItems: [
      { itemId: 'inv-001', description: 'Pregame SS Tee ROYAL', qty: 1, pricePerUnit: 25.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a35', athleteId: 'WBB006', firstName: 'Nico', lastName: 'Sloan',
    barcode: 'WBB2026006', sports: ["Basketball, Women's"], year: 'Junior',
    notes: "Jersey #33. Size M tops, M shorts. Center. Knee sleeve left knee.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a36', athleteId: 'WBB007', firstName: 'Payton', lastName: 'Tran',
    barcode: 'WBB2026007', sports: ["Basketball, Women's"], year: 'Sophomore',
    notes: "Jersey #5. Size S tops, S shorts. Sharp-shooter from Wilmington, DE.",
    issuedItems: [
      { itemId: 'inv-003', description: 'Practice Shorts NAVY', qty: 2, pricePerUnit: 30.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a37', athleteId: 'WBB008', firstName: 'Remy', lastName: 'Vance',
    barcode: 'WBB2026008', sports: ["Basketball, Women's"], year: 'Graduate',
    notes: "Jersey #14. Size M tops, S shorts. Transfer. 5th-year.",
    issuedItems: [
      { itemId: 'inv-005', description: 'ZNE Hoodie NAVY', qty: 1, pricePerUnit: 65.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a38', athleteId: 'WBB009', firstName: 'Sage', lastName: 'Weaver',
    barcode: 'WBB2026009', sports: ["Basketball, Women's"], year: 'Junior',
    notes: "Jersey #1. Size S tops, S shorts. Vice-captain. Plays both guard positions.",
    issuedItems: [
      { itemId: 'inv-001', description: 'Pregame SS Tee ROYAL', qty: 2, pricePerUnit: 25.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
      { itemId: 'inv-006', description: 'Game Jersey HOME', qty: 1, pricePerUnit: 75.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a39', athleteId: 'WBB010', firstName: 'Tatum', lastName: 'Yates',
    barcode: 'WBB2026010', sports: ["Basketball, Women's"], year: 'Freshman',
    notes: "Jersey #22. Size M tops, M shorts. Power forward recruit.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a40', athleteId: 'WBB011', firstName: 'Blake', lastName: 'Abbott',
    barcode: 'WBB2026011', sports: ["Basketball, Women's"], year: 'Senior',
    notes: "Jersey #30. Size L tops, M shorts. Post scorer. Wears finger sleeves on both hands.",
    issuedItems: [
      { itemId: 'inv-002', description: 'Pregame LS Tee ROYAL', qty: 2, pricePerUnit: 28.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a41', athleteId: 'WBB012', firstName: 'Cameron', lastName: 'Blaine',
    barcode: 'WBB2026012', sports: ["Basketball, Women's"], year: 'Sophomore',
    notes: "Jersey #4. Size M tops, S shorts. International student from Nigeria.",
    issuedItems: [
      { itemId: 'inv-003', description: 'Practice Shorts NAVY', qty: 1, pricePerUnit: 30.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a42', athleteId: 'WBB013', firstName: 'Dakota', lastName: 'Cortez',
    barcode: 'WBB2026013', sports: ["Basketball, Women's"], year: 'Junior',
    notes: "Jersey #11. Size S tops, S shorts. Walk-on guard.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a43', athleteId: 'WBB014', firstName: 'Ellis', lastName: 'Dalton',
    barcode: 'WBB2026014', sports: ["Basketball, Women's"], year: 'Graduate',
    notes: "Jersey #42. Size L tops, M shorts. Graduate transfer (Drexel). Interior presence.",
    issuedItems: [
      { itemId: 'inv-005', description: 'ZNE Hoodie NAVY', qty: 1, pricePerUnit: 65.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
      { itemId: 'inv-004', description: 'Warm-Up Pants NAVY', qty: 1, pricePerUnit: 55.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a44', athleteId: 'WBB015', firstName: 'Frankie', lastName: 'Everett',
    barcode: 'WBB2026015', sports: ["Basketball, Women's"], year: 'Freshman',
    notes: "Jersey #23. Size S tops, S shorts. Combo guard from Baltimore.",
    issuedItems: [
      { itemId: 'inv-001', description: 'Pregame SS Tee ROYAL', qty: 1, pricePerUnit: 25.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },

  // ── Baseball (30 players) ───────────────────────────────────
  {
    id: 'a7', athleteId: 'BASE001', firstName: 'Greer', lastName: 'Foster',
    barcode: 'BASE2026001', sports: ['Baseball'], year: 'Junior',
    notes: "Left-handed hitter. Uses C-flap helmet. Arm guard on right arm. Batting gloves size L. Bat: Marucci CAT9 31oz.",
    issuedItems: [
      { itemId: 'inv-020', description: 'BP Jersey BLUE', qty: 2, pricePerUnit: 45.0, issuedDate: '2026-02-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a8', athleteId: 'BASE002', firstName: 'Hayden', lastName: 'Griffin',
    barcode: 'BASE2026002', sports: ['Baseball'], year: 'Senior',
    notes: "Right-handed pitcher. Batting gloves size M. Batting helmet size 7 1/4.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a45', athleteId: 'BASE003', firstName: 'Jesse', lastName: 'Hoffman',
    barcode: 'BASE2026003', sports: ['Baseball'], year: 'Junior',
    notes: "Catcher. Size M tops. Catcher's gear set issued to locker room. Batting gloves size M.",
    issuedItems: [
      { itemId: 'inv-021', description: 'BP Shorts NAVY', qty: 2, pricePerUnit: 35.0, issuedDate: '2026-02-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a46', athleteId: 'BASE004', firstName: 'Kai', lastName: 'Joyce',
    barcode: 'BASE2026004', sports: ['Baseball'], year: 'Sophomore',
    notes: "First baseman. Left-handed. Size L tops. Bat: Louisville Slugger Meta 33oz.",
    issuedItems: [
      { itemId: 'inv-020', description: 'BP Jersey BLUE', qty: 2, pricePerUnit: 45.0, issuedDate: '2026-02-01', isNonExpendable: false, returned: false },
      { itemId: 'inv-022', description: 'Travel Hoodie NAVY', qty: 1, pricePerUnit: 60.0, issuedDate: '2026-02-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a47', athleteId: 'BASE005', firstName: 'Lane', lastName: 'Knox',
    barcode: 'BASE2026005', sports: ['Baseball'], year: 'Senior',
    notes: "Starting pitcher. Size L tops. Wears compression sleeve on pitching arm.",
    issuedItems: [
      { itemId: 'inv-020', description: 'BP Jersey BLUE', qty: 2, pricePerUnit: 45.0, issuedDate: '2026-02-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a48', athleteId: 'BASE006', firstName: 'Marlowe', lastName: 'Lambert',
    barcode: 'BASE2026006', sports: ['Baseball'], year: 'Freshman',
    notes: "Shortstop. Size M tops. Bat: Marucci CATX2 30oz.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a49', athleteId: 'BASE007', firstName: 'Noel', lastName: 'Monroe',
    barcode: 'BASE2026007', sports: ['Baseball'], year: 'Junior',
    notes: "Center fielder. Size M tops. Speed player — sprints to position before every pitch.",
    issuedItems: [
      { itemId: 'inv-021', description: 'BP Shorts NAVY', qty: 1, pricePerUnit: 35.0, issuedDate: '2026-02-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a50', athleteId: 'BASE008', firstName: 'Oakley', lastName: 'Novak',
    barcode: 'BASE2026008', sports: ['Baseball'], year: 'Graduate',
    notes: "Closer. Graduate student. Size XL tops. Throws 93 mph. Needs additional warm-up layers on cold nights.",
    issuedItems: [
      { itemId: 'inv-022', description: 'Travel Hoodie NAVY', qty: 1, pricePerUnit: 60.0, issuedDate: '2026-02-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a51', athleteId: 'BASE009', firstName: 'Perry', lastName: 'Ortega',
    barcode: 'BASE2026009', sports: ['Baseball'], year: 'Sophomore',
    notes: "Second baseman. Size M tops. Switch hitter.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a52', athleteId: 'BASE010', firstName: 'Reagan', lastName: 'Pierce',
    barcode: 'BASE2026010', sports: ['Baseball'], year: 'Junior',
    notes: "Right fielder. Size L tops. Bat: EAB Meta 32oz.",
    issuedItems: [
      { itemId: 'inv-020', description: 'BP Jersey BLUE', qty: 2, pricePerUnit: 45.0, issuedDate: '2026-02-01', isNonExpendable: false, returned: false },
      { itemId: 'inv-021', description: 'BP Shorts NAVY', qty: 1, pricePerUnit: 35.0, issuedDate: '2026-02-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a53', athleteId: 'BASE011', firstName: 'Shiloh', lastName: 'Rhodes',
    barcode: 'BASE2026011', sports: ['Baseball'], year: 'Senior',
    notes: "Third baseman. Size L tops. Power hitter. Batting helmet size 7 3/8.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a54', athleteId: 'BASE012', firstName: 'Toby', lastName: 'Sutton',
    barcode: 'BASE2026012', sports: ['Baseball'], year: 'Freshman',
    notes: "Left fielder. Size M tops. Highly recruited bat from South Jersey.",
    issuedItems: [
      { itemId: 'inv-020', description: 'BP Jersey BLUE', qty: 1, pricePerUnit: 45.0, issuedDate: '2026-02-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a55', athleteId: 'BASE013', firstName: 'Wren', lastName: 'Tobias',
    barcode: 'BASE2026013', sports: ['Baseball'], year: 'Sophomore',
    notes: "Starting pitcher. Size M tops. Works with pitching coach on arm care protocol.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a56', athleteId: 'BASE014', firstName: 'Arden', lastName: 'Vega',
    barcode: 'BASE2026014', sports: ['Baseball'], year: 'Junior',
    notes: "Utility infielder. Size M tops. Can play SS, 2B, or 3B.",
    issuedItems: [
      { itemId: 'inv-021', description: 'BP Shorts NAVY', qty: 2, pricePerUnit: 35.0, issuedDate: '2026-02-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a57', athleteId: 'BASE015', firstName: 'Bellamy', lastName: 'Whitman',
    barcode: 'BASE2026015', sports: ['Baseball'], year: 'Senior',
    notes: "Backup catcher. Size M tops. Catcher's gear in equipment room locker #C4.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a58', athleteId: 'BASE016', firstName: 'Coby', lastName: 'York',
    barcode: 'BASE2026016', sports: ['Baseball'], year: 'Freshman',
    notes: "Outfielder. Size S tops. Walk-on from Newark, DE.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a59', athleteId: 'BASE017', firstName: 'Devon', lastName: 'Zimmer',
    barcode: 'BASE2026017', sports: ['Baseball'], year: 'Junior',
    notes: "Relief pitcher. Size L tops. Left-handed specialist.",
    issuedItems: [
      { itemId: 'inv-022', description: 'Travel Hoodie NAVY', qty: 1, pricePerUnit: 60.0, issuedDate: '2026-02-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a60', athleteId: 'BASE018', firstName: 'Eden', lastName: 'Ashby',
    barcode: 'BASE2026018', sports: ['Baseball'], year: 'Graduate',
    notes: "Graduate student, starting third baseman. Size XL tops. Transfer from Rutgers.",
    issuedItems: [
      { itemId: 'inv-020', description: 'BP Jersey BLUE', qty: 2, pricePerUnit: 45.0, issuedDate: '2026-02-01', isNonExpendable: false, returned: false },
      { itemId: 'inv-022', description: 'Travel Hoodie NAVY', qty: 1, pricePerUnit: 60.0, issuedDate: '2026-02-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a61', athleteId: 'BASE019', firstName: 'Flynn', lastName: 'Boone',
    barcode: 'BASE2026019', sports: ['Baseball'], year: 'Sophomore',
    notes: "Weekend starter. Size M tops. Changeup specialist.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a62', athleteId: 'BASE020', firstName: 'Gray', lastName: 'Crane',
    barcode: 'BASE2026020', sports: ['Baseball'], year: 'Junior',
    notes: "Designated hitter. Size XL tops. Power bat.",
    issuedItems: [
      { itemId: 'inv-020', description: 'BP Jersey BLUE', qty: 2, pricePerUnit: 45.0, issuedDate: '2026-02-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a63', athleteId: 'BASE021', firstName: 'Hollis', lastName: 'Dunn',
    barcode: 'BASE2026021', sports: ['Baseball'], year: 'Freshman',
    notes: "First baseman recruit. Size XL tops. Left-handed bat from Maryland.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a64', athleteId: 'BASE022', firstName: 'Jaden', lastName: 'Emory',
    barcode: 'BASE2026022', sports: ['Baseball'], year: 'Sophomore',
    notes: "Bullpen arm. Size M tops. Two-seam fastball specialist.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a65', athleteId: 'BASE023', firstName: 'Linden', lastName: 'Finch',
    barcode: 'BASE2026023', sports: ['Baseball'], year: 'Senior',
    notes: "Right fielder. Size L tops. 3-year starter, career-high 9 HR last season.",
    issuedItems: [
      { itemId: 'inv-022', description: 'Travel Hoodie NAVY', qty: 1, pricePerUnit: 60.0, issuedDate: '2026-02-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a66', athleteId: 'BASE024', firstName: 'Marin', lastName: 'Gaines',
    barcode: 'BASE2026024', sports: ['Baseball'], year: 'Junior',
    notes: "Shortstop. Size M tops. Premium glove: Rawlings HOH 11.5in.",
    issuedItems: [
      { itemId: 'inv-021', description: 'BP Shorts NAVY', qty: 1, pricePerUnit: 35.0, issuedDate: '2026-02-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a67', athleteId: 'BASE025', firstName: 'Nova', lastName: 'Holt',
    barcode: 'BASE2026025', sports: ['Baseball'], year: 'Graduate',
    notes: "Graduate student, weekend starter. Size M tops. Transfer (La Salle). Slider-heavy arsenal.",
    issuedItems: [
      { itemId: 'inv-020', description: 'BP Jersey BLUE', qty: 2, pricePerUnit: 45.0, issuedDate: '2026-02-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a68', athleteId: 'BASE026', firstName: 'Oren', lastName: 'Jarrett',
    barcode: 'BASE2026026', sports: ['Baseball'], year: 'Freshman',
    notes: "Center fielder. Size M tops. Walk-on from Cape Henlopen HS.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a69', athleteId: 'BASE027', firstName: 'Robin', lastName: 'Kramer',
    barcode: 'BASE2026027', sports: ['Baseball'], year: 'Sophomore',
    notes: "Catcher. Size M tops. Backup. Takes extra repetitions with blocking drills.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a70', athleteId: 'BASE028', firstName: 'Sasha', lastName: 'Lund',
    barcode: 'BASE2026028', sports: ['Baseball'], year: 'Junior',
    notes: "Relief arm. Size L tops. Goes long in bullpen sessions.",
    issuedItems: [
      { itemId: 'inv-022', description: 'Travel Hoodie NAVY', qty: 1, pricePerUnit: 60.0, issuedDate: '2026-02-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a71', athleteId: 'BASE029', firstName: 'Teagan', lastName: 'Marsh',
    barcode: 'BASE2026029', sports: ['Baseball'], year: 'Senior',
    notes: "Second baseman. Size M tops. Academic All-CAA. Helmet size 7 1/8.",
    issuedItems: [
      { itemId: 'inv-020', description: 'BP Jersey BLUE', qty: 2, pricePerUnit: 45.0, issuedDate: '2026-02-01', isNonExpendable: false, returned: false },
      { itemId: 'inv-021', description: 'BP Shorts NAVY', qty: 1, pricePerUnit: 35.0, issuedDate: '2026-02-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a72', athleteId: 'BASE030', firstName: 'West', lastName: 'Nolan',
    barcode: 'BASE2026030', sports: ['Baseball'], year: 'Freshman',
    notes: "Left-handed reliever. Size S tops. Great command for a freshman.",
    issuedItems: [],
    photoUrl: undefined,
  },

  // ── Men's Tennis (8 players) ────────────────────────────────
  {
    id: 'a13', athleteId: 'MTEN001', firstName: 'Ari', lastName: 'Oakes',
    barcode: 'MTEN2026001', sports: ["Tennis, Men's"], year: 'Junior',
    notes: "Racket: Wilson Blade 98 v8, grip size 4 3/8. Strings: Luxilon ALU Power 1.25mm. Prefers clay-court shoes.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a73', athleteId: 'MTEN002', firstName: 'Bo', lastName: 'Paxton',
    barcode: 'MTEN2026002', sports: ["Tennis, Men's"], year: 'Senior',
    notes: "Italian national. Racket: Babolat Pure Aero 2023, grip 4 3/8. Strings: RPM Blast 1.25mm. No. 1 singles.",
    issuedItems: [
      { itemId: 'inv-040', description: 'Team Polo ROYAL', qty: 2, pricePerUnit: 45.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
      { itemId: 'inv-041', description: 'Tennis Shorts NAVY', qty: 2, pricePerUnit: 40.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a74', athleteId: 'MTEN003', firstName: 'Cleo', lastName: 'Quill',
    barcode: 'MTEN2026003', sports: ["Tennis, Men's"], year: 'Sophomore',
    notes: "Spanish player. Racket: Head Extreme Tour, grip 4 1/4. Strings: Polyfibre Hightec Premium 1.25mm. Baseline grinder.",
    issuedItems: [
      { itemId: 'inv-040', description: 'Team Polo ROYAL', qty: 2, pricePerUnit: 45.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a75', athleteId: 'MTEN004', firstName: 'Dez', lastName: 'Reed',
    barcode: 'MTEN2026004', sports: ["Tennis, Men's"], year: 'Junior',
    notes: "Czech Republic. Racket: Wilson Pro Staff 97 v13, grip 4 3/8. Strings: Wilson NXT 1.30mm. Serve-and-volley style.",
    issuedItems: [
      { itemId: 'inv-041', description: 'Tennis Shorts NAVY', qty: 1, pricePerUnit: 40.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a76', athleteId: 'MTEN005', firstName: 'Ezra', lastName: 'Sable',
    barcode: 'MTEN2026005', sports: ["Tennis, Men's"], year: 'Graduate',
    notes: "Swedish graduate student. Racket: Yonex VCORE 98, grip 4 3/8. Strings: Yonex Poly Tour Pro 1.25mm. All-court game.",
    issuedItems: [
      { itemId: 'inv-040', description: 'Team Polo ROYAL', qty: 2, pricePerUnit: 45.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
      { itemId: 'inv-042', description: 'Travel Jacket NAVY', qty: 1, pricePerUnit: 85.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a77', athleteId: 'MTEN006', firstName: 'Fen', lastName: 'Thorne',
    barcode: 'MTEN2026006', sports: ["Tennis, Men's"], year: 'Sophomore',
    notes: "Japanese player. Racket: Dunlop CX 200, grip 4 1/4. Strings: Technifibre Black Code 1.24mm. Strong backhand.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a78', athleteId: 'MTEN007', firstName: 'Gio', lastName: 'Vaughn',
    barcode: 'MTEN2026007', sports: ["Tennis, Men's"], year: 'Freshman',
    notes: "Colombian player. Racket: Wilson Ultra 100 v3, grip 4 3/8. Strings: Solinco Hyper-G 1.25mm. Heavy topspin.",
    issuedItems: [
      { itemId: 'inv-040', description: 'Team Polo ROYAL', qty: 1, pricePerUnit: 45.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a79', athleteId: 'MTEN008', firstName: 'Hux', lastName: 'Wade',
    barcode: 'MTEN2026008', sports: ["Tennis, Men's"], year: 'Senior',
    notes: "Greek player. Racket: Babolat Pure Drive v8, grip 4 3/8. Strings: Luxilon ALU Power 1.27mm. No. 2 singles, doubles captain.",
    issuedItems: [
      { itemId: 'inv-040', description: 'Team Polo ROYAL', qty: 2, pricePerUnit: 45.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
      { itemId: 'inv-042', description: 'Travel Jacket NAVY', qty: 1, pricePerUnit: 85.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },

  // ── Women's Tennis (8 players) ──────────────────────────────
  {
    id: 'a14', athleteId: 'WTEN001', firstName: 'Ivo', lastName: 'Yardley',
    barcode: 'WTEN2026001', sports: ["Tennis, Women's"], year: 'Senior',
    notes: "Racket: Babolat Pure Drive 2021, grip size 4 1/4. Strings: RPM Blast 1.30mm.",
    issuedItems: [],
    photoUrl: undefined,
  },
  {
    id: 'a80', athleteId: 'WTEN002', firstName: 'Jax', lastName: 'Zane',
    barcode: 'WTEN2026002', sports: ["Tennis, Women's"], year: 'Junior',
    notes: "Argentinian player. Racket: Head Speed MP, grip 4 1/4. Strings: Head Hawk 1.25mm. No. 1 singles, powerful forehand.",
    issuedItems: [
      { itemId: 'inv-043', description: 'Team Polo WHITE', qty: 2, pricePerUnit: 45.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
      { itemId: 'inv-044', description: 'Tennis Skirt NAVY', qty: 2, pricePerUnit: 42.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a81', athleteId: 'WTEN003', firstName: 'Kip', lastName: 'Ames',
    barcode: 'WTEN2026003', sports: ["Tennis, Women's"], year: 'Sophomore',
    notes: "Japanese player. Racket: Yonex EZONE 98, grip 4 1/8. Strings: Yonex Poly Tour Spin 1.25mm. Compact swing, elite footwork.",
    issuedItems: [
      { itemId: 'inv-043', description: 'Team Polo WHITE', qty: 2, pricePerUnit: 45.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a82', athleteId: 'WTEN004', firstName: 'Lux', lastName: 'Beck',
    barcode: 'WTEN2026004', sports: ["Tennis, Women's"], year: 'Graduate',
    notes: "French graduate student. Racket: Wilson Blade 98S, grip 4 1/4. Strings: Tecnifibre NRG2 1.30mm. Slice and net game.",
    issuedItems: [
      { itemId: 'inv-043', description: 'Team Polo WHITE', qty: 2, pricePerUnit: 45.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
      { itemId: 'inv-045', description: 'Travel Jacket NAVY', qty: 1, pricePerUnit: 85.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a83', athleteId: 'WTEN005', firstName: 'Mel', lastName: 'Cole',
    barcode: 'WTEN2026005', sports: ["Tennis, Women's"], year: 'Junior',
    notes: "Swedish player. Racket: Head Gravity Pro, grip 4 1/4. Strings: Solinco Confidential 1.20mm. Big serve for her size.",
    issuedItems: [
      { itemId: 'inv-044', description: 'Tennis Skirt NAVY', qty: 2, pricePerUnit: 42.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a84', athleteId: 'WTEN006', firstName: 'Nix', lastName: 'Doyle',
    barcode: 'WTEN2026006', sports: ["Tennis, Women's"], year: 'Freshman',
    notes: "Mexican player. Racket: Wilson Clash 100 Pro, grip 4 1/8. Strings: Wilson Sensation 1.30mm. Highly recruited all-court player.",
    issuedItems: [
      { itemId: 'inv-043', description: 'Team Polo WHITE', qty: 1, pricePerUnit: 45.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a85', athleteId: 'WTEN007', firstName: 'Ollie', lastName: 'Ford',
    barcode: 'WTEN2026007', sports: ["Tennis, Women's"], year: 'Senior',
    notes: "Indian player. Racket: Babolat Pure Strike 16x19, grip 4 1/4. Strings: Babolat RPM Power 1.30mm. No. 2 singles, doubles specialist.",
    issuedItems: [
      { itemId: 'inv-043', description: 'Team Polo WHITE', qty: 2, pricePerUnit: 45.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
      { itemId: 'inv-045', description: 'Travel Jacket NAVY', qty: 1, pricePerUnit: 85.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a86', athleteId: 'WTEN008', firstName: 'Pia', lastName: 'Gable',
    barcode: 'WTEN2026008', sports: ["Tennis, Women's"], year: 'Sophomore',
    notes: "Serbian player. Racket: Head Radical MP, grip 4 1/4. Strings: Head Lynx 1.25mm. Two-handed backhand.",
    issuedItems: [],
    photoUrl: undefined,
  },

  // ── Football ────────────────────────────────────────────────
  {
    id: 'a9', athleteId: 'FB001', firstName: 'Rio', lastName: 'Hines',
    barcode: 'FB2026001', sports: ['Football'], year: 'Senior',
    notes: "QB. Jersey #7. Wears 2XL game jersey, XL practice. Helmet size L – Riddell SpeedFlex.",
    issuedItems: [
      { itemId: 'inv-010', description: 'Riddell SpeedFlex Helmet', qty: 1, pricePerUnit: 350.0, issuedDate: '2026-08-01', isNonExpendable: true, returnByDate: '2027-01-15', returned: false },
      { itemId: 'inv-011', description: 'Game Jersey HOME', qty: 1, pricePerUnit: 120.0, issuedDate: '2026-08-01', isNonExpendable: false, returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a10', athleteId: 'FB002', firstName: 'Sol', lastName: 'Ives',
    barcode: 'FB2026002', sports: ['Football'], year: 'Junior',
    notes: "WR. Jersey #11. Helmet size M. Gloves: Cutters size L.",
    issuedItems: [
      { itemId: 'inv-010', description: 'Riddell SpeedFlex Helmet', qty: 1, pricePerUnit: 350.0, issuedDate: '2026-08-01', isNonExpendable: true, returnByDate: '2027-01-15', returned: false },
    ],
    photoUrl: undefined,
  },

  // ── Field Hockey ────────────────────────────────────────────
  {
    id: 'a11', athleteId: 'FH001', firstName: 'Tex', lastName: 'Judd',
    barcode: 'FH2026001', sports: ['Field Hockey'], year: 'Senior',
    notes: "Captain. Stick: Adidas TX Carbon 70% 36in. Shin guards size M.",
    issuedItems: [
      { itemId: 'inv-030', description: 'Winter Travel Jacket NAVY', qty: 1, pricePerUnit: 110.0, issuedDate: '2026-09-01', isNonExpendable: true, returnByDate: '2026-12-15', returned: false },
    ],
    photoUrl: undefined,
  },
  {
    id: 'a12', athleteId: 'FH002', firstName: 'Uma', lastName: 'Kane',
    barcode: 'FH2026002', sports: ['Field Hockey'], year: 'Sophomore',
    notes: "Stick: Grays GX7000 37in. Left-handed. Goalkeeper backup.",
    issuedItems: [
      { itemId: 'inv-030', description: 'Winter Travel Jacket NAVY', qty: 1, pricePerUnit: 110.0, issuedDate: '2026-09-01', isNonExpendable: true, returnByDate: '2026-12-15', returned: false },
    ],
    photoUrl: undefined,
  },

  // ── Softball ────────────────────────────────────────────────
  {
    id: 'a15', athleteId: 'SB001', firstName: 'Alex', lastName: 'Rivera',
    barcode: 'SB2026001', sports: ['Softball'], year: 'Senior',
    notes: "Pitcher. Right-handed. Glove: Wilson A2000 fastpitch 12in.",
    issuedItems: [
      { itemId: 'inv-031', description: 'Winter Travel Jacket NAVY', qty: 1, pricePerUnit: 110.0, issuedDate: '2026-09-05', isNonExpendable: true, returnByDate: '2026-12-15', returned: false },
    ],
    photoUrl: undefined,
  },

  // ── Soccer Men's ────────────────────────────────────────────
  {
    id: 'a16', athleteId: 'MSOC001', firstName: 'Jordan', lastName: 'Chen',
    barcode: 'MSOC2026001', sports: ["Soccer, Men's"], year: 'Junior',
    notes: "GK. Gloves: Reusch Attrakt G3 size 10. Jersey #1.",
    issuedItems: [],
    photoUrl: undefined,
  },

  // ── Soccer Women's ──────────────────────────────────────────
  {
    id: 'a17', athleteId: 'WSOC001', firstName: 'Sam', lastName: 'Taylor',
    barcode: 'WSOC2026001', sports: ["Soccer, Women's"], year: 'Sophomore',
    notes: "Forward. Jersey #9. Size S tops.",
    issuedItems: [],
    photoUrl: undefined,
  },

  // ── Lacrosse Men's ──────────────────────────────────────────
  {
    id: 'a18', athleteId: 'MLAX001', firstName: 'Casey', lastName: 'Morgan',
    barcode: 'MLAX2026001', sports: ["Lacrosse, Men's"], year: 'Senior',
    notes: "Attack. Shaft: ECD Carbon Pro 2.0. Head: STX Stallion 900.",
    issuedItems: [],
    photoUrl: undefined,
  },

  // ── Lacrosse Women's ────────────────────────────────────────
  {
    id: 'a19', athleteId: 'WLAX001', firstName: 'Taylor', lastName: 'Bishop',
    barcode: 'WLAX2026001', sports: ["Lacrosse, Women's"], year: 'Junior',
    notes: "Midfield. Goggles: STX 4Sight+ size S.",
    issuedItems: [],
    photoUrl: undefined,
  },

  // ── Volleyball ──────────────────────────────────────────────
  {
    id: 'a20', athleteId: 'VB001', firstName: 'Morgan', lastName: 'Carson',
    barcode: 'VB2026001', sports: ['Volleyball'], year: 'Senior',
    notes: "Setter. Jersey #7. Knee pads size M. Shoes: Mizuno Wave Lightning Z7 size 9.",
    issuedItems: [],
    photoUrl: undefined,
  },
];
