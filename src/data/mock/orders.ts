import type { Order } from '../types';

export const orders: Order[] = [
  {
    id: 'ord-200637', refNumber: 'MBB Workout Sneaker', orderDate: '2026-05-15',
    vendor: 'BSN Sports - Adidas', sport: "Basketball, Men's",
    lines: [{ description: 'Workout Sneaker WHITE', qtyOrdered: 15, qtyReceived: 15 }],
    status: 'complete', createdBy: 'Parry, Bryce',
  },
  {
    id: 'ord-193301', refNumber: 'MBB Coach Shorts', orderDate: '2026-03-10',
    vendor: 'BSN Sports - Adidas', sport: "Basketball, Men's",
    lines: [
      { description: 'Coach Shorts NAVY M', qtyOrdered: 8, qtyReceived: 8 },
      { description: 'Coach Shorts NAVY L', qtyOrdered: 8, qtyReceived: 8 },
    ],
    status: 'complete', createdBy: 'Parry, Bryce',
  },
  {
    id: 'ord-193280', refNumber: 'MBB Hooded Tees 2026', orderDate: '2026-03-10',
    vendor: 'BSN Sports - Adidas', sport: "Basketball, Men's",
    lines: [
      { description: 'Hooded Tee NAVY S', qtyOrdered: 20, qtyReceived: 5 },
      { description: 'Hooded Tee NAVY M', qtyOrdered: 32, qtyReceived: 5 },
      { description: 'Hooded Tee NAVY L', qtyOrdered: 32, qtyReceived: 3 },
    ],
    status: 'incomplete', createdBy: 'Parry, Bryce',
  },
  {
    id: 'ord-193248', refNumber: 'MBB ZNE Navy 2026', orderDate: '2026-03-10',
    vendor: 'Adidas', sport: "Basketball, Men's",
    lines: [
      { description: 'ZNE Hoodie NAVY M', qtyOrdered: 29, qtyReceived: 1 },
      { description: 'ZNE Hoodie NAVY L', qtyOrdered: 29, qtyReceived: 0 },
    ],
    status: 'incomplete', createdBy: 'Parry, Bryce',
  },
  {
    id: 'ord-193245', refNumber: 'MBB ZNE Black 2026', orderDate: '2026-03-10',
    vendor: 'Adidas', sport: "Basketball, Men's",
    lines: [
      { description: 'ZNE Hoodie BLACK M', qtyOrdered: 29, qtyReceived: 0 },
      { description: 'ZNE Hoodie BLACK L', qtyOrdered: 29, qtyReceived: 0 },
    ],
    status: 'submitted', createdBy: 'Parry, Bryce',
  },
  {
    id: 'ord-193242', refNumber: 'MBB Compressions 2026', orderDate: '2026-03-10',
    vendor: 'BSN Sports - Adidas', sport: "Basketball, Men's",
    lines: [
      { description: 'Compression Tight S', qtyOrdered: 58, qtyReceived: 58 },
      { description: 'Compression Short S', qtyOrdered: 58, qtyReceived: 58 },
      { description: 'Compression Tight M', qtyOrdered: 59, qtyReceived: 59 },
    ],
    status: 'complete', createdBy: 'Parry, Bryce',
  },
  {
    id: 'ord-192899', refNumber: 'MBB Court Shoes 2026', orderDate: '2026-03-04',
    vendor: 'Adidas', sport: "Basketball, Men's",
    lines: [
      { description: 'Court Shoes size 11', qtyOrdered: 22, qtyReceived: 0 },
      { description: 'Court Shoes size 12', qtyOrdered: 22, qtyReceived: 0 },
      { description: 'Court Shoes size 13', qtyOrdered: 22, qtyReceived: 0 },
      { description: 'Court Shoes size 14', qtyOrdered: 22, qtyReceived: 0 },
    ],
    status: 'submitted', createdBy: 'Parry, Bryce',
  },
  {
    id: 'ord-180001', refNumber: 'FB Helmet Reorder 2026', orderDate: '2026-07-01',
    vendor: 'BSN Sports - Adidas', sport: 'Football',
    lines: [
      { description: 'Riddell SpeedFlex Helmet L', qtyOrdered: 20, qtyReceived: 20 },
      { description: 'Riddell SpeedFlex Helmet XL', qtyOrdered: 15, qtyReceived: 10 },
    ],
    status: 'incomplete', createdBy: 'Whitfield, Al',
  },
  {
    id: 'ord-175001', refNumber: 'FH Winter Jackets 2026', orderDate: '2026-07-15',
    vendor: 'Adidas', sport: 'Field Hockey',
    lines: [{ description: 'Winter Travel Jacket NAVY', qtyOrdered: 25, qtyReceived: 25 }],
    status: 'complete', createdBy: 'Morris, Jamie',
  },
  {
    id: 'ord-170001', refNumber: 'BASE BP Jerseys 2026', orderDate: '2026-01-20',
    vendor: 'BSN Sports - Adidas', sport: 'Baseball',
    lines: [
      { description: 'BP Jersey BLUE S', qtyOrdered: 10, qtyReceived: 10 },
      { description: 'BP Jersey BLUE M', qtyOrdered: 10, qtyReceived: 10 },
      { description: 'BP Jersey BLUE L', qtyOrdered: 10, qtyReceived: 10 },
    ],
    status: 'complete', createdBy: 'Parry, Bryce',
  },
];
