import type { Transaction } from '../types';

export const transactions: Transaction[] = [
  {
    id: 'tx-JX4476', type: 'issue', personId: 'a5', personName: 'Adams, Destiny',
    sport: "Basketball, Women's",
    items: [{ itemId: 'inv-001', description: 'Pregame SS Tee BLACK', qty: 1 }],
    timestamp: '2026-06-22T09:14:00Z', createdBy: 'Parry, Bryce',
  },
  {
    id: 'tx-JX4486', type: 'issue', personId: 'a6', personName: 'Dickey, Jasmine',
    sport: "Basketball, Women's",
    items: [{ itemId: 'inv-002', description: 'Pregame LS Tee GREY', qty: 1 }],
    timestamp: '2026-06-22T09:18:00Z', createdBy: 'Parry, Bryce',
  },
  {
    id: 'tx-JX4481', type: 'issue', personId: 'a5', personName: 'Adams, Destiny',
    sport: "Basketball, Women's",
    items: [{ itemId: 'inv-002', description: 'Pregame LS Tee ROYAL', qty: 1 }],
    timestamp: '2026-06-22T09:22:00Z', createdBy: 'Parry, Bryce',
  },
  {
    id: 'tx-JX4452', type: 'issue', personId: 'a6', personName: 'Dickey, Jasmine',
    sport: "Basketball, Women's",
    items: [{ itemId: 'inv-001', description: 'Pregame SS Tee BLACK', qty: 1 }],
    timestamp: '2026-06-22T09:30:00Z', createdBy: 'Parry, Bryce',
  },
  {
    id: 'tx-JX4455', type: 'issue', personId: 'a5', personName: 'Adams, Destiny',
    sport: "Basketball, Women's",
    items: [{ itemId: 'inv-001', description: 'Pregame SS Tee GREY', qty: 1 }],
    timestamp: '2026-06-22T09:45:00Z', createdBy: 'Parry, Bryce',
  },
  {
    id: 'tx-MBB001', type: 'issue', personId: 'a1', personName: 'Davis, Jyare',
    sport: "Basketball, Men's",
    items: [
      { itemId: 'inv-001', description: 'Pregame SS Tee ROYAL', qty: 2 },
      { itemId: 'inv-003', description: 'Practice Shorts NAVY', qty: 2 },
    ],
    timestamp: '2026-06-01T10:00:00Z', createdBy: 'Parry, Bryce',
  },
  {
    id: 'tx-MBB002', type: 'issue', personId: 'a2', personName: 'Sherwood, Dylan',
    sport: "Basketball, Men's",
    items: [{ itemId: 'inv-001', description: 'Pregame SS Tee ROYAL', qty: 2 }],
    timestamp: '2026-06-01T10:05:00Z', createdBy: 'Parry, Bryce',
  },
  {
    id: 'tx-FB001', type: 'issue', personId: 'a9', personName: 'Webb, Marcus',
    sport: 'Football',
    items: [
      { itemId: 'inv-010', description: 'Riddell SpeedFlex Helmet', qty: 1 },
      { itemId: 'inv-011', description: 'Game Jersey HOME', qty: 1 },
    ],
    timestamp: '2026-08-01T08:00:00Z', createdBy: 'Whitfield, Al',
  },
  {
    id: 'tx-FB002', type: 'issue', personId: 'a10', personName: 'Thompson, Darius',
    sport: 'Football',
    items: [{ itemId: 'inv-010', description: 'Riddell SpeedFlex Helmet', qty: 1 }],
    timestamp: '2026-08-01T08:10:00Z', createdBy: 'Whitfield, Al',
  },
  {
    id: 'tx-FH001', type: 'issue', personId: 'a11', personName: 'Clarke, Sophie',
    sport: 'Field Hockey',
    items: [{ itemId: 'inv-030', description: 'Winter Travel Jacket NAVY', qty: 1 }],
    timestamp: '2026-09-01T14:00:00Z', createdBy: 'Morris, Jamie',
  },
  {
    id: 'tx-FH002', type: 'issue', personId: 'a12', personName: 'Osei, Nadia',
    sport: 'Field Hockey',
    items: [{ itemId: 'inv-030', description: 'Winter Travel Jacket NAVY', qty: 1 }],
    timestamp: '2026-09-01T14:05:00Z', createdBy: 'Morris, Jamie',
  },
  {
    id: 'tx-BASE001', type: 'issue', personId: 'a7', personName: 'Rogers, Ethan',
    sport: 'Baseball',
    items: [{ itemId: 'inv-020', description: 'BP Jersey BLUE', qty: 2 }],
    timestamp: '2026-02-01T11:00:00Z', createdBy: 'Parry, Bryce',
  },
];
