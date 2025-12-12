/**
 * Family members data for AI competitors
 * Each family member races against Rosie in their own lane
 */

/**
 * Speed tuning configuration
 * Adjust SPEED_SCALE to make all racers faster (>1) or slower (<1)
 * Base speeds below are multiplied by this factor
 */
export const SPEED_CONFIG = {
  /** Global multiplier for all racer speeds. Adjust this single value to tune race difficulty. */
  SPEED_SCALE: 0.7,
  /** How much slower min speed is relative to max (0 = same as max, 1 = much slower min) */
  VARIANCE_FACTOR: 0.5,
} as const;

export interface FamilyMember {
  id: string;
  name: string;
  color: number; // Hex color for avatar
  baseMinSpeed: number; // Base minimum speed before scaling (pixels per second)
  baseMaxSpeed: number; // Base maximum speed before scaling (pixels per second)
  role: string; // Family role description
}

/** Computed min speed for a family member after applying scale and variance */
export function getMinSpeed(member: FamilyMember): number {
  const scaledMin = member.baseMinSpeed * SPEED_CONFIG.SPEED_SCALE;
  // Apply variance: lower the min speed further to create more variance
  return scaledMin * (1 - SPEED_CONFIG.VARIANCE_FACTOR);
}

/** Computed max speed for a family member after applying scale */
export function getMaxSpeed(member: FamilyMember): number {
  return member.baseMaxSpeed * SPEED_CONFIG.SPEED_SCALE;
}

/**
 * Family members who race against Rosie
 * Rosie is in lane 1 (index 0), 5 random members selected for lanes 2-6
 */
export const FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'mommy',
    name: 'Mommy',
    color: 0x4a90d9, // Blue
    baseMinSpeed: 35,
    baseMaxSpeed: 55,
    role: 'Mom',
  },
  {
    id: 'daddy',
    name: 'Daddy',
    color: 0x2ecc71, // Green
    baseMinSpeed: 40,
    baseMaxSpeed: 58,
    role: 'Dad',
  },
  {
    id: 'uncle-zack',
    name: 'Uncle Zack',
    color: 0xe67e22, // Orange
    baseMinSpeed: 33,
    baseMaxSpeed: 51,
    role: 'Uncle',
  },
  {
    id: 'gaga',
    name: 'Gaga',
    color: 0x9b59b6, // Purple
    baseMinSpeed: 30,
    baseMaxSpeed: 48,
    role: 'Grandma',
  },
  {
    id: 'grandpa',
    name: 'Grandpa',
    color: 0xe74c3c, // Red
    baseMinSpeed: 27,
    baseMaxSpeed: 45,
    role: 'Grandpa',
  },
  {
    id: 'lalo',
    name: 'Lalo',
    color: 0xf1c40f, // Yellow/Gold (for the dog)
    baseMinSpeed: 42,
    baseMaxSpeed: 60,
    role: 'Dog',
  },
];

/**
 * Get a family member by ID
 */
export function getFamilyMemberById(id: string): FamilyMember | undefined {
  return FAMILY_MEMBERS.find((member) => member.id === id);
}

/**
 * Get all family member IDs
 */
export function getFamilyMemberIds(): string[] {
  return FAMILY_MEMBERS.map((member) => member.id);
}

/**
 * Get a random selection of family members for a race
 * @param count Number of racers to select (default 5 for lanes 2-6)
 * @returns Array of randomly selected family members
 */
export function getRandomRacers(count: number = 5): FamilyMember[] {
  const shuffled = [...FAMILY_MEMBERS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, FAMILY_MEMBERS.length));
}
