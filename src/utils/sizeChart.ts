import type { Athlete, CustomSizeEntry, ItemCategory, Sport } from '../data/types';

export const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
export const SHOE_SIZES = Array.from({ length: 25 }, (_, i) => { // '5'..'17' in half-size steps
  const whole = 5 + Math.floor(i / 2);
  return i % 2 === 0 ? String(whole) : `${whole}.5`;
});
// Fielding glove size = hand opening in inches.
export const GLOVE_SIZES = ['11"', '11.25"', '11.5"', '11.75"', '12"', '12.25"', '12.5"', '12.75"', '13"'];
// Bat size = length (in) / weight (oz), the standard BBCOR drop-3 combos.
export const BAT_SIZES = ['31"/28oz', '32"/29oz', '32"/30oz', '33"/30oz', '33"/31oz', '34"/31oz'];
export const YES_NO = ['Yes', 'No'];
export const PANT_STYLE = ['High', 'Low'];
// Soccer goalie glove sizing (youth 3 - adult 11).
export const GOALIE_GLOVE_SIZES = ['3', '4', '5', '6', '7', '8', '9', '10', '11'];
// Standard tennis grip circumferences.
export const GRIP_SIZES = ['4 1/8', '4 1/4', '4 3/8', '4 1/2', '4 5/8'];
// Common hockey stick flex ratings.
export const STICK_FLEX = ['50', '60', '70', '75', '80', '85', '87', '95', '100', '102', '105', '110'];
export const LAX_STICK_LENGTH = ['Short Stick (Attack/Middie)', 'Long Stick (Defense/LSM)'];
export const VISOR_STYLE = ['Full Shield', 'Half Shield/Bubble', 'None'];
export const FOOTBALL_GLOVE_STYLE = ['Skill', 'Padded'];

/**
 * Label keyword -> size scale, most specific phrase first so compound labels
 * (e.g. "Batting Glove Style") don't fall into the wrong generic bucket.
 * Returns [] for fields that are inherently free text (stick curve, racket
 * model, track event, etc.) — the UI renders a plain input for those.
 */
export function sizeOptionsFor(label: string): string[] {
  const l = label.toLowerCase();
  if (l.includes('batting glove')) return CLOTHING_SIZES;
  if (l.includes('goalie glove')) return GOALIE_GLOVE_SIZES;
  if (l.includes('golf glove')) return CLOTHING_SIZES;
  if (l.includes('football glove') || l.includes('glove style')) return FOOTBALL_GLOVE_STYLE;
  if (l.includes('glove')) return GLOVE_SIZES;
  if (l.includes('bat')) return BAT_SIZES;
  if (l.includes('cleat') || l.includes('skate') || l.includes('spike') || l.includes('shoe')) return SHOE_SIZES;
  if (l.includes('c-flap') || l.includes('cflap') || l.includes('c flap')) return YES_NO;
  if (l.includes('cage') || l.includes('mouthguard')) return YES_NO;
  if (l.includes('pant style')) return PANT_STYLE;
  if (l.includes('grip')) return GRIP_SIZES;
  if (l.includes('flex')) return STICK_FLEX;
  if (l.includes('stick length') || l.includes('lacrosse stick')) return LAX_STICK_LENGTH;
  if (l.includes('visor') || l.includes('bubble') || l.includes('shield')) return VISOR_STYLE;
  // Free text: curve, racket/racquet model, event, under-gear/pad model, notes, etc.
  if (l.includes('curve') || l.includes('racket') || l.includes('racquet') || l.includes('event') || l.includes('model')) return [];
  return CLOTHING_SIZES;
}

/**
 * Universal fields every sport's intake form starts with.
 */
export const BASE_SIZE_FIELDS = ['Shirt Size', 'Shorts Size', 'Shoe Size', 'Cleat Size'];

/**
 * Extra, sport-specific size-chart fields offered on top of the universal
 * Shirt/Shorts/Shoe/Cleat base — e.g. bat/glove for Baseball, stick flex for
 * Ice Hockey, Speedo size for Swimming. Drives both the self-service intake
 * form and can double as a starting point for an athlete's Size Chart.
 */
export const SPORT_SIZE_FIELDS: Record<Sport, string[]> = {
  Baseball: ['Glove Size', 'Bat Size', 'Batting Glove Size', 'C-Flap', 'Pant Style'],
  Softball: ['Glove Size', 'Bat Size', 'Batting Glove Size', 'Face Cage', 'Pant Style'],
  Football: ['Glove Style', 'Practice Jersey Size', 'Practice Pant Size'],
  "Basketball, Men's": ['Shooting Sleeve Size', 'Warm-Up Size'],
  "Basketball, Women's": ['Shooting Sleeve Size', 'Warm-Up Size'],
  Volleyball: ['Knee Pad Size'],
  "Soccer, Men's": ['Goalie Glove Size (if goalie)'],
  "Soccer, Women's": ['Goalie Glove Size (if goalie)'],
  'Field Hockey': ['Shin Guard Size', 'Mouthguard Needed'],
  'Ice Hockey': ['Skate Size', 'Glove Size', 'Stick Flex', 'Stick Curve', 'Visor Style'],
  "Lacrosse, Men's": ['Stick Length', 'Glove Size'],
  "Lacrosse, Women's": ['Stick Length', 'Glove Size'],
  "Golf, Men's": ['Golf Glove Size'],
  "Golf, Women's": ['Golf Glove Size'],
  'Cross Country': ['Spike Size', 'Event'],
  'Track & Field, Indoor': ['Event', 'Spike Size'],
  'Track & Field, Outdoor': ['Event', 'Spike Size'],
  Rowing: ['Unisuit Size'],
  "Swimming & Diving, Men's": ['Speedo/Swimsuit Size'],
  "Swimming & Diving, Women's": ['Speedo/Swimsuit Size'],
  "Tennis, Men's": ['Racket Grip Size', 'Racket Model'],
  "Tennis, Women's": ['Racket Grip Size', 'Racket Model'],
};

/** Every sport, alphabetical — derived from SPORT_SIZE_FIELDS so there's one source of truth. */
export const ALL_SPORTS = (Object.keys(SPORT_SIZE_FIELDS) as Sport[]).sort();

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

const ALL_SCALES = [CLOTHING_SIZES, SHOE_SIZES, GLOVE_SIZES, BAT_SIZES, GOALIE_GLOVE_SIZES, GRIP_SIZES, STICK_FLEX, LAX_STICK_LENGTH, VISOR_STYLE, FOOTBALL_GLOVE_STYLE, PANT_STYLE, YES_NO];

/** Ascending size-scale position within whichever known scale contains it; unrecognized/free-text values sort last. */
export function sizeSortIndex(size: string): number {
  for (let s = 0; s < ALL_SCALES.length; s++) {
    const idx = ALL_SCALES[s].indexOf(size);
    if (idx !== -1) return s * 100 + idx;
  }
  return 9999;
}
