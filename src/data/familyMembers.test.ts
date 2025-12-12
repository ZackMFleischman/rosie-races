import type { FamilyMember } from './familyMembers';
import {
  FAMILY_MEMBERS,
  getFamilyMemberById,
  getFamilyMemberIds,
  getRandomRacers,
} from './familyMembers';

describe('familyMembers', () => {
  describe('FAMILY_MEMBERS', () => {
    it('should have 6 family members available', () => {
      expect(FAMILY_MEMBERS).toHaveLength(6);
    });

    it('should include all expected family members', () => {
      const names = FAMILY_MEMBERS.map((m) => m.name);
      expect(names).toContain('Mommy');
      expect(names).toContain('Daddy');
      expect(names).toContain('Uncle Zack');
      expect(names).toContain('Gaga');
      expect(names).toContain('Grandpa');
      expect(names).toContain('Lalo');
    });

    it('should have unique IDs for each member', () => {
      const ids = FAMILY_MEMBERS.map((m) => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(FAMILY_MEMBERS.length);
    });

    it('should have unique colors for each member', () => {
      const colors = FAMILY_MEMBERS.map((m) => m.color);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(FAMILY_MEMBERS.length);
    });

    it('should have valid speed ranges for all members', () => {
      FAMILY_MEMBERS.forEach((member: FamilyMember) => {
        expect(member.minSpeed).toBeGreaterThan(0);
        expect(member.maxSpeed).toBeGreaterThan(member.minSpeed);
      });
    });

    it('should have roles matching the family relationships', () => {
      const memberRoles = FAMILY_MEMBERS.reduce(
        (acc, m) => {
          acc[m.id] = m.role;
          return acc;
        },
        {} as Record<string, string>
      );

      expect(memberRoles['mommy']).toBe('Mom');
      expect(memberRoles['daddy']).toBe('Dad');
      expect(memberRoles['uncle-zack']).toBe('Uncle');
      expect(memberRoles['gaga']).toBe('Grandma');
      expect(memberRoles['grandpa']).toBe('Grandpa');
      expect(memberRoles['lalo']).toBe('Dog');
    });
  });

  describe('getFamilyMemberById', () => {
    it('should return the correct family member when found', () => {
      const mommy = getFamilyMemberById('mommy');
      expect(mommy).toBeDefined();
      expect(mommy?.name).toBe('Mommy');
      expect(mommy?.role).toBe('Mom');
    });

    it('should return undefined for non-existent ID', () => {
      const notFound = getFamilyMemberById('unknown-member');
      expect(notFound).toBeUndefined();
    });

    it('should find each family member by their ID', () => {
      FAMILY_MEMBERS.forEach((member) => {
        const found = getFamilyMemberById(member.id);
        expect(found).toEqual(member);
      });
    });
  });

  describe('getFamilyMemberIds', () => {
    it('should return all family member IDs', () => {
      const ids = getFamilyMemberIds();
      expect(ids).toHaveLength(6);
      expect(ids).toContain('mommy');
      expect(ids).toContain('daddy');
      expect(ids).toContain('uncle-zack');
      expect(ids).toContain('gaga');
      expect(ids).toContain('grandpa');
      expect(ids).toContain('lalo');
    });

    it('should return IDs in the same order as FAMILY_MEMBERS', () => {
      const ids = getFamilyMemberIds();
      const expectedIds = FAMILY_MEMBERS.map((m) => m.id);
      expect(ids).toEqual(expectedIds);
    });
  });

  describe('getRandomRacers', () => {
    it('should return 5 racers by default', () => {
      const racers = getRandomRacers();
      expect(racers).toHaveLength(5);
    });

    it('should return the requested number of racers', () => {
      expect(getRandomRacers(3)).toHaveLength(3);
      expect(getRandomRacers(4)).toHaveLength(4);
      expect(getRandomRacers(5)).toHaveLength(5);
    });

    it('should not return more racers than available', () => {
      const racers = getRandomRacers(10);
      expect(racers).toHaveLength(6); // Only 6 family members exist
    });

    it('should return unique racers (no duplicates)', () => {
      const racers = getRandomRacers(5);
      const ids = racers.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });

    it('should return valid family members', () => {
      const racers = getRandomRacers(5);
      racers.forEach((racer) => {
        expect(FAMILY_MEMBERS).toContainEqual(racer);
      });
    });

    it('should return different selections on multiple calls (randomness)', () => {
      // Run multiple times and check we get different results at least once
      const selections: string[][] = [];
      for (let i = 0; i < 10; i++) {
        const racers = getRandomRacers(5);
        selections.push(racers.map((r) => r.id).sort());
      }
      // Check that not all selections are identical
      const uniqueSelections = new Set(selections.map((s) => s.join(',')));
      expect(uniqueSelections.size).toBeGreaterThan(1);
    });
  });
});
