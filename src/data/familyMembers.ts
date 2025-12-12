/**
 * Family members data for AI competitors
 * Each family member races against Rosie in their own lane
 */

export interface FamilyMember {
  id: string;
  name: string;
  color: number; // Hex color for avatar
  minSpeed: number; // Minimum speed (pixels per second)
  maxSpeed: number; // Maximum speed (pixels per second)
  role: string; // Family role description
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
    minSpeed: 35,
    maxSpeed: 55,
    role: 'Mom',
  },
  {
    id: 'daddy',
    name: 'Daddy',
    color: 0x2ecc71, // Green
    minSpeed: 40,
    maxSpeed: 58,
    role: 'Dad',
  },
  {
    id: 'uncle-zack',
    name: 'Uncle Zack',
    color: 0xe67e22, // Orange
    minSpeed: 33,
    maxSpeed: 51,
    role: 'Uncle',
  },
  {
    id: 'gaga',
    name: 'Gaga',
    color: 0x9b59b6, // Purple
    minSpeed: 30,
    maxSpeed: 48,
    role: 'Grandma',
  },
  {
    id: 'grandpa',
    name: 'Grandpa',
    color: 0xe74c3c, // Red
    minSpeed: 27,
    maxSpeed: 45,
    role: 'Grandpa',
  },
  {
    id: 'lalo',
    name: 'Lalo',
    color: 0xf1c40f, // Yellow/Gold (for the dog)
    minSpeed: 42,
    maxSpeed: 60,
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
