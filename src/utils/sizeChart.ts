import type { Athlete, CustomSizeEntry, ItemCategory } from '../data/types';

export const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
export const SHOE_SIZES = Array.from({ length: 25 }, (_, i) => { // '5'..'17' in half-size steps
  const whole = 5 + Math.floor(i / 2);
  return i % 2 === 0 ? String(whole) : `${whole}.5`;
});
// Glove size = hand opening in inches, the standard way infield/outfield gloves are sized.
export const GLOVE_SIZES = ['11"', '11.25"', '11.5"', '11.75"', '12"', '12.25"', '12.5"', '12.75"', '13"'];
// Bat size = length (in) / weight (oz), the standard BBCOR drop-3 combos.
export const BAT_SIZES = ['31"/28oz', '32"/29oz', '32"/30oz', '33"/30oz', '33"/31oz', '34"/31oz'];

/** Label keyword -> size scale. First match wins; unrecognized labels get clothing sizes. */
export function sizeOptionsFor(label: string): string[] {
  const l = label.toLowerCase();
  if (l.includes('glove')) return GLOVE_SIZES;
  if (l.includes('bat')) return BAT_SIZES;
  if (l.includes('shoe')) return SHOE_SIZES;
  return CLOTHING_SIZES;
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

/** Ascending size-scale position (clothing, shoe, glove, or bat); unrecognized sorts last. */
export function sizeSortIndex(size: string): number {
  const clothingIdx = CLOTHING_SIZES.indexOf(size);
  if (clothingIdx !== -1) return clothingIdx;
  const shoeIdx = SHOE_SIZES.indexOf(size);
  if (shoeIdx !== -1) return 100 + shoeIdx;
  const gloveIdx = GLOVE_SIZES.indexOf(size);
  if (gloveIdx !== -1) return 200 + gloveIdx;
  const batIdx = BAT_SIZES.indexOf(size);
  if (batIdx !== -1) return 300 + batIdx;
  return 999;
}
