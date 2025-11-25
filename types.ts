
export enum GameState {
  START_SCREEN,
  WORLD_MAP,
  BATTLE,
  GAME_OVER,
  VICTORY
}

export enum Subject {
  MATH = 'Math',
  SCIENCE = 'Science',
  HISTORY = 'History',
  LANGUAGE = 'Language',
  ART = 'Art',
  CS = 'Computer Science'
}

export enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT
}

export interface Move {
  id: string;
  name: string;
  power: number;
  accuracy: number;
  type: Subject;
  isSpecial: boolean; // Requires a quiz question
  description: string;
}

export interface Creature {
  id: string;
  name: string;
  type: Subject;
  maxHp: number;
  currentHp: number;
  level: number;
  xp: number;
  toNextLevel: number;
  moves: Move[];
  spriteColor: string; // Hex code for generated sprite background
  icon: string; // Lucide icon name
}

export interface Trainer {
  id: string;
  name: string;
  introDialog: string;
  defeatDialog: string;
  postBattleDialog: string;
  creatureId: string;
  creatureLevel: number;
  rewardItemId?: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Tile {
  id: number;
  type: 'walkable' | 'wall' | 'grass' | 'door' | 'healer' | 'npc' | 'trainer';
  description?: string;
  warpTo?: string; // Map ID
  warpPos?: Position;
  interactionId?: string;
  trainerId?: string;
}

export interface GameMap {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: number[][]; // Grid of tile IDs
  encounters: string[]; // Creature IDs available here
}

export interface QuestState {
  hasStarter: boolean;
  badges: string[];
  talkedToProfessor: boolean;
  defeatedTrainers: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export enum ItemType {
  CONSUMABLE = 'consumable',
  MATERIAL = 'material'
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  effectValue?: number; // e.g. HP amount
}

export interface Recipe {
  id: string;
  resultId: string;
  ingredients: { itemId: string; count: number }[];
}
