import type { Athlete, CustomSizeEntry, ItemCategory } from '../data/types';

export const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
export const SHOE_SIZES = Array.from({ length: 25 }, (_, i) => { // '5'..'17' in half-size steps
  const whole = 5 + Math.floor(i / 2);
  return i % 2 === 0 ? String(whole) : `${whole}.5`;
});

/** Whichever field is a "shoe" gets the shoe-size range; everything else gets clothing sizes. */
export function sizeOptionsFor(label: string): string[] {
  return label.toLowerCase().includes('shoe') ? SHOE_SIZES : CLOTHING_SIZES;
}

/**
 * Every athlete starts with these standard fields, pre-filled from their profile
 * sizes where available. Once a manager edits/adds/removes anything on the athlete's
 * Size Chart, that saved list takes over permanently — this default only fills the gap.
 */
export function getAthleteSizes(athlete: Athlete): CustomSizeEntry[] {
  return athlete.customSizes ?? [
    { id: 'default-shirt', label: 'Shirt Size', value: athlete.shirtSize ?? '' },
    { id: 'default-shorts', label: 'Shorts Size', value: athlete.shortsSize ?? '' },
    { id: 'default-sweatshirt', label: 'Sweatshirt Size', value: '' },
    { id: 'default-pants', label: 'Pant Size', value: '' },
    { id: 'default-shoe', label: 'Shoe Size', value: athlete.shoeSize ?? '' },
  ];
}

/** Best-guess size-chart field name for an inventory item's category. */
export function defaultSizeFieldFor(category: ItemCategory): string | null {
  switch (category) {
    case 'Top': return 'Shirt Size';
    case 'Bottom': return 'Shorts Size';
    case 'Outerwear': return 'Sweatshirt Size';
    case 'Footwear': return 'Shoe Size';
    default: return null;
  }
}

/** Ascending size-scale position (clothing or shoe); anything unrecognized sorts last. */
export function sizeSortIndex(size: string): number {
  const clothingIdx = CLOTHING_SIZES.indexOf(size);
  if (clothingIdx !== -1) return clothingIdx;
  const shoeIdx = SHOE_SIZES.indexOf(size);
  if (shoeIdx !== -1) return 100 + shoeIdx;
  return 999;
}
