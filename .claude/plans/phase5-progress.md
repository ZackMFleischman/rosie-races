# Phase 5 Progress - AI Competitors

## Status: In Progress (Partial Implementation)

## Completed

### 1. Family Members Data File Created
**File:** `src/data/familyMembers.ts`

```typescript
export interface FamilyMember {
  id: string;
  name: string;
  color: number; // Hex color for avatar
  minSpeed: number; // Minimum speed (pixels per second)
  maxSpeed: number; // Maximum speed (pixels per second)
  role: string; // Family role description
}

export const FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'mommy', name: 'Mommy', color: 0x4a90d9, minSpeed: 60, maxSpeed: 90, role: 'Mom' },
  { id: 'daddy', name: 'Daddy', color: 0x2ecc71, minSpeed: 65, maxSpeed: 95, role: 'Dad' },
  { id: 'uncle-zack', name: 'Uncle Zack', color: 0xe67e22, minSpeed: 55, maxSpeed: 85, role: 'Uncle' },
  { id: 'gaga', name: 'Gaga', color: 0x9b59b6, minSpeed: 50, maxSpeed: 80, role: 'Grandma' },
  { id: 'lalo', name: 'Lalo', color: 0xf1c40f, minSpeed: 70, maxSpeed: 100, role: 'Dog' },
];
```

## Remaining Work for Phase 5

### Changes needed in `src/game/scenes/RaceScene.ts`:

#### 1. Add Import
```typescript
import { FAMILY_MEMBERS, type FamilyMember } from '../../data/familyMembers';
```

#### 2. Add Competitor Interface
```typescript
export interface Competitor {
  sprite: Phaser.GameObjects.Arc;
  nameLabel: Phaser.GameObjects.Text;
  familyMember: FamilyMember;
  speed: number;
  baseSpeed: number;
  baseY: number;
  hasFinished: boolean;
  finishTime: number | null;
}
```

#### 3. Add Constants
```typescript
export const COMPETITOR_CONFIG = {
  SPEED_VARIATION_INTERVAL: 2000,
  SPEED_VARIATION_RANGE: 5,
  AVATAR_RADIUS: 25,
};

// Add to TRACK_CONFIG:
ROSIE_LANE_HIGHLIGHT: 0xffc0cb, // Light pink for lane highlight
```

#### 4. Add Class Properties
```typescript
private competitors: Competitor[] = [];
private lastSpeedVariationTime: number = 0;
private leadIndicator: Phaser.GameObjects.Text | null = null;
private rosieNameLabel: Phaser.GameObjects.Text | null = null;
private raceStartTime: number = 0;
```

#### 5. Add Methods

**createCompetitors()** - Creates colored circle avatars for each family member in lanes 2-6

**updateCompetitors(time, delta)** - Moves AI racers at their assigned speeds (they don't stop for checkpoints)

**varyCompetitorSpeeds()** - Adds subtle speed variations every 2 seconds for realism

**resetCompetitors()** - Resets all competitors to start position with new random speeds

**createLeadIndicator()** - Shows "1st: [Name]" in top-right corner

**updateLeadIndicator()** - Updates the lead indicator each frame

**getRacePositions()** - Returns all racers sorted by x position

**getRosiePosition()** - Returns Rosie's current position (1st, 2nd, etc.)

#### 6. Modify Existing Methods

**drawLanes()** - Highlight Rosie's lane (index 0) with light pink color and border

**create()** - Call createCompetitors(), createRosie(), createLeadIndicator()

**update()** - Call updateCompetitors() and updateLeadIndicator() when race has started

**handleRestart()** - Call resetCompetitors()

**handleTap()** - Set raceStartTime on first tap

## Testing Required
- Test that all 6 racers appear in their lanes
- Test that AI racers move at varying speeds
- Test that AI racers don't stop at checkpoints
- Test that lead indicator updates correctly
- Test that restart resets all competitors

## Implementation Plan Checklist Status
- [x] Define family data (src/data/familyMembers.ts)
- [ ] 5 family members in lanes
- [ ] Random speed per racer
- [ ] Rosie's lane highlighted
- [ ] AI moves at varying speeds
- [ ] Speed variations for realism
- [ ] AI doesn't stop for checkpoints
- [ ] Placeholder avatars
- [ ] Lane name labels
- [ ] Lead indicator
