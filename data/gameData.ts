
import { Creature, Move, Subject, GameMap, Tile, Item, ItemType, Recipe, Trainer } from '../types';

// --- Items ---
export const ITEMS: Record<string, Item> = {
  'logic_leaf': { id: 'logic_leaf', name: 'Logic Leaf', type: ItemType.MATERIAL, description: 'A leaf with geometric veins.' },
  'pixel_water': { id: 'pixel_water', name: 'Pixel Water', type: ItemType.MATERIAL, description: 'Water that shimmers digitally.' },
  'code_scrap': { id: 'code_scrap', name: 'Code Scrap', type: ItemType.MATERIAL, description: 'A fragment of raw data.' },
  'history_dust': { id: 'history_dust', name: 'History Dust', type: ItemType.MATERIAL, description: 'Sand from the hourglass of time.' },
  'data_potion': { id: 'data_potion', name: 'Data Potion', type: ItemType.CONSUMABLE, description: 'Restores 20 HP.', effectValue: 20 },
  'super_potion': { id: 'super_potion', name: 'Super Potion', type: ItemType.CONSUMABLE, description: 'Restores 50 HP.', effectValue: 50 },
};

export const RECIPES: Recipe[] = [
  {
    id: 'craft_potion',
    resultId: 'data_potion',
    ingredients: [
      { itemId: 'logic_leaf', count: 1 },
      { itemId: 'pixel_water', count: 1 }
    ]
  },
  {
    id: 'craft_super_potion',
    resultId: 'super_potion',
    ingredients: [
      { itemId: 'data_potion', count: 1 },
      { itemId: 'code_scrap', count: 1 }
    ]
  },
  {
    id: 'recycle_potion',
    resultId: 'data_potion',
    ingredients: [
        { itemId: 'history_dust', count: 2 }
    ]
  }
];

// --- Moves ---
export const MOVES: Record<string, Move> = {
  'tackle': { id: 'tackle', name: 'Quick Study', power: 20, accuracy: 100, type: Subject.CS, isSpecial: false, description: 'A quick review of notes.' },
  'pi_slam': { id: 'pi_slam', name: 'Pi Slam', power: 60, accuracy: 90, type: Subject.MATH, isSpecial: true, description: 'Crush with infinite decimals.' },
  'beaker_splash': { id: 'beaker_splash', name: 'Acid Base', power: 60, accuracy: 90, type: Subject.SCIENCE, isSpecial: true, description: 'A volatile mixture.' },
  'quote_strike': { id: 'quote_strike', name: 'Quote Strike', power: 60, accuracy: 95, type: Subject.LANGUAGE, isSpecial: true, description: 'Words hurt.' },
  'history_rush': { id: 'history_rush', name: 'Time Warp', power: 65, accuracy: 85, type: Subject.HISTORY, isSpecial: true, description: 'Rewrite the past.' },
  'color_blast': { id: 'color_blast', name: 'Prism Ray', power: 60, accuracy: 90, type: Subject.ART, isSpecial: true, description: 'Blinding colors.' },
  'bug_bite': { id: 'bug_bite', name: 'Syntax Error', power: 65, accuracy: 85, type: Subject.CS, isSpecial: true, description: 'Crash the system.' },
};

// --- Creatures ---
export const CREATURES_DB: Record<string, Omit<Creature, 'currentHp' | 'xp' | 'toNextLevel'>> = {
  'calc_boy': {
    id: 'calc_boy',
    name: 'Additurt',
    type: Subject.MATH,
    maxHp: 40,
    level: 5,
    moves: [MOVES['tackle'], MOVES['pi_slam']],
    spriteColor: '#3b82f6',
    icon: 'Calculator'
  },
  'sci_guy': {
    id: 'sci_guy',
    name: 'Fizzflask',
    type: Subject.SCIENCE,
    maxHp: 38,
    level: 5,
    moves: [MOVES['tackle'], MOVES['beaker_splash']],
    spriteColor: '#10b981',
    icon: 'FlaskConical'
  },
  'book_worm': {
    id: 'book_worm',
    name: 'Wordy',
    type: Subject.LANGUAGE,
    maxHp: 45,
    level: 5,
    moves: [MOVES['tackle'], MOVES['quote_strike']],
    spriteColor: '#f59e0b',
    icon: 'BookOpen'
  },
  'hist_hound': {
    id: 'hist_hound',
    name: 'Pastpup',
    type: Subject.HISTORY,
    maxHp: 42,
    level: 5,
    moves: [MOVES['tackle'], MOVES['history_rush']],
    spriteColor: '#8b5cf6',
    icon: 'Hourglass'
  },
  'paint_pal': {
    id: 'paint_pal',
    name: 'Sketchy',
    type: Subject.ART,
    maxHp: 35,
    level: 5,
    moves: [MOVES['tackle'], MOVES['color_blast']],
    spriteColor: '#ec4899',
    icon: 'Brush'
  },
  'byte_bit': {
    id: 'byte_bit',
    name: 'Glitch',
    type: Subject.CS,
    maxHp: 30,
    level: 5,
    moves: [MOVES['tackle'], MOVES['bug_bite']],
    spriteColor: '#6366f1',
    icon: 'Laptop'
  }
};

// --- Trainers ---
export const TRAINERS: Record<string, Trainer> = {
  'student_tim': {
    id: 'student_tim',
    name: 'Crammer Tim',
    introDialog: "I stayed up all night memorizing the dictionary!",
    defeatDialog: "I... I need to sleep...",
    postBattleDialog: "Don't underestimate the power of a good nap.",
    creatureId: 'book_worm',
    creatureLevel: 7,
    rewardItemId: 'logic_leaf'
  },
  'mathlete_jen': {
    id: 'mathlete_jen',
    name: 'Mathlete Jen',
    introDialog: "My calculations say you have a 0% chance of winning!",
    defeatDialog: "My formula was wrong?!",
    postBattleDialog: "I need to re-check my variables.",
    creatureId: 'calc_boy',
    creatureLevel: 10,
    rewardItemId: 'pixel_water'
  },
  'historian_ben': {
    id: 'historian_ben',
    name: 'Historian Ben',
    introDialog: "Those who do not learn from history are doomed to lose to me!",
    defeatDialog: "I'm history!",
    postBattleDialog: "Perhaps I should study the future instead.",
    creatureId: 'hist_hound',
    creatureLevel: 14,
    rewardItemId: 'history_dust'
  }
};

// --- Maps ---
// 0: Walk, 1: Wall, 2: Grass, 3: Door, 4: Healer, 5: NPC, 6: Sage, 7: Gym Leader, 8: Trainer
export const TILES: Record<number, Tile> = {
  0: { id: 0, type: 'walkable' },
  1: { id: 1, type: 'wall' },
  2: { id: 2, type: 'grass' },
  3: { id: 3, type: 'door' },
  4: { id: 4, type: 'healer', interactionId: 'healer' },
  5: { id: 5, type: 'npc', interactionId: 'professor' },
  6: { id: 6, type: 'npc', interactionId: 'sage' },
  7: { id: 7, type: 'npc', interactionId: 'gym_leader' },
  // Trainers (Dynamic content based on map placement logic, but generic ID here)
  8: { id: 8, type: 'trainer' }, // Specific trainer ID assigned in map rendering/logic
};

// Helper to create trainer tiles
// We will handle the ID mapping in the interaction logic by position or distinct tile IDs
// For simplicity in this static data, we'll define specific Tile IDs for specific trainers if we want simple lookup,
// OR we handle it by coordinates in App.tsx. 
// Let's verify: The app logic looks up TILES[id].
// To keep it simple, let's make distinct tile IDs for specific trainers.

export const TRAINER_TILES: Record<number, Tile> = {
  101: { id: 101, type: 'trainer', trainerId: 'student_tim' },
  102: { id: 102, type: 'trainer', trainerId: 'mathlete_jen' },
  103: { id: 103, type: 'trainer', trainerId: 'historian_ben' },
};

// Merge into main tiles
Object.assign(TILES, TRAINER_TILES);


// 1. Scholar Town
export const TOWN_MAP: GameMap = {
  id: 'town',
  name: 'Scholar Town',
  width: 15,
  height: 10,
  encounters: [],
  tiles: [
    [1, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 1], // Exit to Route 1 (Top)
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
    [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 1], // Healer
    [1, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
    [1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 1, 3, 1, 1], // Lab Door
    [1, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 1], 
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ]
};

// Lab (Attached to Town)
export const LAB_MAP: GameMap = {
  id: 'lab',
  name: 'Professor Lab',
  width: 8,
  height: 8,
  encounters: [],
  tiles: [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 5, 0, 1, 1], // Professor
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 3, 3, 1, 1, 1], // Exit to Town
    [1, 1, 1, 1, 1, 1, 1, 1],
  ]
};

// 2. Equation Path
export const ROUTE_MAP: GameMap = {
  id: 'route1',
  name: 'Equation Path',
  width: 10,
  height: 15,
  encounters: ['calc_boy', 'byte_bit'],
  tiles: [
    [1, 1, 1, 1, 3, 3, 1, 1, 1, 1], // Exit to Forest 1 (Top)
    [1, 1, 2, 2, 0, 0, 2, 2, 1, 1],
    [1, 2, 2, 2, 0, 0, 2, 2, 2, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 101, 0, 0, 0, 0, 1], // TRAINER: Tim
    [1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
    [1, 2, 2, 0, 0, 0, 2, 2, 2, 1],
    [1, 2, 2, 0, 0, 0, 2, 2, 2, 1],
    [1, 2, 2, 0, 0, 0, 2, 2, 2, 1],
    [1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 2, 2, 2, 1, 1, 1, 1],
    [1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
    [1, 1, 1, 3, 3, 3, 1, 1, 1, 1], // Exit to Town (Bottom)
  ]
};

// 3. Algebra Woods
export const FOREST1_MAP: GameMap = {
  id: 'forest1',
  name: 'Algebra Woods',
  width: 12,
  height: 12,
  encounters: ['sci_guy', 'calc_boy'],
  tiles: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 1, 1, 2, 2, 0, 0, 0, 3], // Exit to Forest 2 (Right - Edge)
    [1, 2, 2, 2, 1, 1, 2, 2, 0, 0, 0, 3], // Exit to Forest 2 (Right - Edge)
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 2, 2, 1, 1, 1, 0, 1, 1],
    [1, 1, 1, 1, 2, 2, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 102, 1, 1], // TRAINER: Jen
    [1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
    [1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1], // Path
    [1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1], // Exit to Route 1 (Bottom - Edge)
  ]
};

// 4. Geometry Grove
export const FOREST2_MAP: GameMap = {
  id: 'forest2',
  name: 'Geometry Grove',
  width: 12,
  height: 10,
  encounters: ['sci_guy', 'book_worm'],
  tiles: [
    [1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1], // Exit to Town 2 (Top)
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Exit to Forest 1 (Left)
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ]
};

// 5. Library Village
export const TOWN2_MAP: GameMap = {
  id: 'town2',
  name: 'Library Village',
  width: 12,
  height: 10,
  encounters: ['paint_pal'],
  tiles: [
    [1, 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1], // Exit to Mountain (Top)
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 0, 4, 0, 0, 0, 1], // Healer at (7,3)
    [1, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 1], // Library Door at (3,4)
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1], // Exit to Forest 2 (Bottom)
  ]
};

// Library Map (The Challenge)
export const LIBRARY_MAP: GameMap = {
  id: 'library',
  name: 'Grand Library',
  width: 10,
  height: 10,
  encounters: [],
  tiles: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 7, 0, 0, 1, 1, 1], // Gym Leader (7)
    [1, 0, 0, 1, 1, 1, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 3, 3, 1, 1, 1, 1], // Exit to Town
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ]
};

// 6. Math Mountain
export const MOUNTAIN_MAP: GameMap = {
  id: 'mountain',
  name: 'Math Mountain',
  width: 10,
  height: 14,
  encounters: ['hist_hound', 'byte_bit'],
  tiles: [
    [1, 1, 1, 1, 3, 3, 1, 1, 1, 1], // Exit to Cave (Top)
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
    [1, 2, 2, 2, 0, 0, 2, 2, 2, 1],
    [1, 2, 2, 2, 0, 0, 2, 2, 2, 1],
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 103, 0, 0, 0, 0, 1], // TRAINER: Ben
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 0, 1, 1, 1, 1, 1],
    [1, 2, 2, 0, 0, 2, 2, 2, 2, 1],
    [1, 2, 2, 0, 0, 2, 2, 2, 2, 1],
    [1, 1, 1, 0, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 3, 3, 1, 1, 1, 1, 1], // Exit to Town 2 (Bottom)
  ]
};

// 7. Logic Cavern
export const CAVE_MAP: GameMap = {
  id: 'cave',
  name: 'Logic Cavern',
  width: 12,
  height: 12,
  encounters: ['hist_hound', 'sci_guy'],
  tiles: [
    [1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1], // Exit to Pass (Top)
    [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1], 
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1], // Exit to Mountain (Bottom)
  ]
};

// 8. Study Pass
export const PASS_MAP: GameMap = {
  id: 'pass',
  name: 'Study Pass',
  width: 10,
  height: 15,
  encounters: ['book_worm', 'paint_pal'],
  tiles: [
    [1, 1, 1, 1, 3, 3, 1, 1, 1, 1], // Exit to Peak (Top)
    [1, 2, 2, 0, 0, 0, 0, 2, 2, 1], 
    [1, 2, 2, 0, 0, 0, 0, 2, 2, 1],
    [1, 2, 2, 0, 0, 0, 0, 2, 2, 1],
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
    [1, 2, 2, 0, 0, 0, 0, 2, 2, 1],
    [1, 2, 2, 0, 0, 0, 0, 2, 2, 1],
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 3, 3, 1, 1, 1, 1], // Exit to Cave (Bottom)
  ]
};

// 9. Knowledge Peak
export const SUMMIT_MAP: GameMap = {
  id: 'peak',
  name: 'Knowledge Peak',
  width: 13,
  height: 13,
  encounters: ['hist_hound', 'book_worm', 'calc_boy', 'sci_guy'],
  tiles: [
    [1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1], // Exit to Infinite (Top)
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1], 
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 1, 1, 1, 6, 1, 1, 1, 0, 1, 1], // Sage
    [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1], // Exit to Pass (Bottom)
  ]
};

export const ALL_MAPS: Record<string, GameMap> = {
  'town': TOWN_MAP,
  'lab': LAB_MAP,
  'route1': ROUTE_MAP,
  'forest1': FOREST1_MAP,
  'forest2': FOREST2_MAP,
  'town2': TOWN2_MAP,
  'library': LIBRARY_MAP,
  'mountain': MOUNTAIN_MAP,
  'cave': CAVE_MAP,
  'pass': PASS_MAP,
  'peak': SUMMIT_MAP
};
