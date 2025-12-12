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
 * Rosie is in lane 1 (index 0), so these 5 members occupy lanes 2-6
 */
export const FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'mommy',
    name: 'Mommy',
    color: 0x4a90d9, // Blue
    minSpeed: 60,
    maxSpeed: 90,
    role: 'Mom',
  },
  {
    id: 'daddy',
    name: 'Daddy',
    color: 0x2ecc71, // Green
    minSpeed: 65,
    maxSpeed: 95,
    role: 'Dad',
  },
  {
    id: 'uncle-zack',
    name: 'Uncle Zack',
    color: 0xe67e22, // Orange
    minSpeed: 55,
    maxSpeed: 85,
    role: 'Uncle',
  },
  {
    id: 'gaga',
    name: 'Gaga',
    color: 0x9b59b6, // Purple
    minSpeed: 50,
    maxSpeed: 80,
    role: 'Grandma',
  },
  {
    id: 'lalo',
    name: 'Lalo',
    color: 0xf1c40f, // Yellow/Gold (for the dog)
    minSpeed: 70,
    maxSpeed: 100,
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
