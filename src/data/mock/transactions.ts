import type { Transaction } from '../types';

export const transactions: Transaction[] = [
  {
    id: 'tx-JX4476', type: 'issue', personId: 'a53', personName: 'Johnson, Kennise',
    sport: "Basketball, Women's",
    items: [{ itemId: 'inv-001', description: 'Pregame SS Tee BLACK', qty: 1 }],
    timestamp: '2026-06-22T09:14:00Z', createdBy: 'Stevens, Peter',
  },
  {
    id: 'tx-JX4486', type: 'issue', personId: 'a54', personName: 'Kolliegbo, Safi',
    sport: "Basketball, Women's",
    items: [{ itemId: 'inv-002', description: 'Pregame LS Tee GREY', qty: 1 }],
    timestamp: '2026-06-22T09:18:00Z', createdBy: 'Stevens, Peter',
  },
  {
    id: 'tx-JX4481', type: 'issue', personId: 'a53', personName: 'Johnson, Kennise',
    sport: "Basketball, Women's",
    items: [{ itemId: 'inv-002', description: 'Pregame LS Tee ROYAL', qty: 1 }],
    timestamp: '2026-06-22T09:22:00Z', createdBy: 'Stevens, Peter',
  },
  {
    id: 'tx-JX4452', type: 'issue', personId: 'a54', personName: 'Kolliegbo, Safi',
    sport: "Basketball, Women's",
    items: [{ itemId: 'inv-001', description: 'Pregame SS Tee BLACK', qty: 1 }],
    timestamp: '2026-06-22T09:30:00Z', createdBy: 'Stevens, Peter',
  },
  {
    id: 'tx-JX4455', type: 'issue', personId: 'a53', personName: 'Johnson, Kennise',
    sport: "Basketball, Women's",
    items: [{ itemId: 'inv-001', description: 'Pregame SS Tee GREY', qty: 1 }],
    timestamp: '2026-06-22T09:45:00Z', createdBy: 'Stevens, Peter',
  },
  {
    id: 'tx-MBB001', type: 'issue', personId: 'a38', personName: "Bailey III, Chuck",
    sport: "Basketball, Men's",
    items: [
      { itemId: 'inv-001', description: 'Pregame SS Tee ROYAL', qty: 2 },
      { itemId: 'inv-003', description: 'Practice Shorts NAVY', qty: 2 },
    ],
    timestamp: '2026-06-01T10:00:00Z', createdBy: 'Stevens, Peter',
  },
  {
    id: 'tx-MBB002', type: 'issue', personId: 'a39', personName: 'Ellison, Mason',
    sport: "Basketball, Men's",
    items: [{ itemId: 'inv-001', description: 'Pregame SS Tee ROYAL', qty: 2 }],
    timestamp: '2026-06-01T10:05:00Z', createdBy: 'Stevens, Peter',
  },
  {
    id: 'tx-FB001', type: 'issue', personId: 'a113', personName: "Price, Q'yaeir",
    sport: 'Football',
    items: [
      { itemId: 'inv-010', description: 'Riddell SpeedFlex Helmet', qty: 1 },
      { itemId: 'inv-011', description: 'Game Jersey HOME', qty: 1 },
    ],
    timestamp: '2026-08-01T08:00:00Z', createdBy: 'Whitfield, Al',
  },
  {
    id: 'tx-FB002', type: 'issue', personId: 'a114', personName: 'Graves, Bryson',
    sport: 'Football',
    items: [{ itemId: 'inv-010', description: 'Riddell SpeedFlex Helmet', qty: 1 }],
    timestamp: '2026-08-01T08:10:00Z', createdBy: 'Whitfield, Al',
  },
  {
    id: 'tx-FH001', type: 'issue', personId: 'a88', personName: 'Cosner, Lily',
    sport: 'Field Hockey',
    items: [{ itemId: 'inv-030', description: 'Winter Travel Jacket NAVY', qty: 1 }],
    timestamp: '2026-09-01T14:00:00Z', createdBy: 'Morris, Jamie',
  },
  {
    id: 'tx-FH002', type: 'issue', personId: 'a89', personName: 'Kousouris, Penelope',
    sport: 'Field Hockey',
    items: [{ itemId: 'inv-030', description: 'Winter Travel Jacket NAVY', qty: 1 }],
    timestamp: '2026-09-01T14:05:00Z', createdBy: 'Morris, Jamie',
  },
  {
    id: 'tx-BASE001', type: 'issue', personId: 'a1', personName: 'Hitchcock, Timmy',
    sport: 'Baseball',
    items: [{ itemId: 'inv-020', description: 'BP Jersey BLUE', qty: 2 }],
    timestamp: '2026-02-01T11:00:00Z', createdBy: 'Stevens, Peter',
  },
];
