export interface SportBudget {
  sport: string;
  budgeted: number;
  spent: number;
}

export const BUDGET_DATA: SportBudget[] = [
  { sport: "Basketball, Men's",    budgeted: 120000, spent: 87000 },
  { sport: "Basketball, Women's",  budgeted: 110000, spent: 72000 },
  { sport: 'Baseball',             budgeted: 85000,  spent: 61000 },
  { sport: 'Football',             budgeted: 200000, spent: 155000 },
  { sport: 'Field Hockey',         budgeted: 70000,  spent: 48000 },
  { sport: 'Softball',             budgeted: 65000,  spent: 39000 },
  { sport: "Soccer, Men's",        budgeted: 75000,  spent: 52000 },
  { sport: "Soccer, Women's",      budgeted: 75000,  spent: 47000 },
  { sport: "Lacrosse, Men's",      budgeted: 60000,  spent: 41000 },
  { sport: "Lacrosse, Women's",    budgeted: 60000,  spent: 38000 },
  { sport: 'Volleyball',           budgeted: 55000,  spent: 32000 },
  { sport: 'Cross Country',        budgeted: 30000,  spent: 18000 },
  { sport: 'Track & Field, Indoor', budgeted: 40000, spent: 27000 },
  { sport: 'Track & Field, Outdoor', budgeted: 40000, spent: 29000 },
  { sport: "Swimming & Diving, Men's", budgeted: 35000, spent: 22000 },
  { sport: "Swimming & Diving, Women's", budgeted: 35000, spent: 24000 },
  { sport: "Tennis, Men's",        budgeted: 28000,  spent: 19000 },
  { sport: "Tennis, Women's",      budgeted: 28000,  spent: 21000 },
  { sport: 'Ice Hockey',           budgeted: 90000,  spent: 68000 },
  { sport: 'Rowing',               budgeted: 45000,  spent: 31000 },
  { sport: "Golf, Men's",          budgeted: 22000,  spent: 15000 },
  { sport: "Golf, Women's",        budgeted: 22000,  spent: 14000 },
];
