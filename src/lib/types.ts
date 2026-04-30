import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type SlotType = 'chassis' | 'wheel' | 'engine' | 'weapon' | 'armor';

export interface Part {
  id: string;
  name: string;
  type: SlotType;
  weight: number;
  power?: number;
  speed?: number;
  armor?: number;
  damage?: number;
  description: string;
  icon: string;
}

export type EquippedParts = {
  [key in SlotType]: Part | null;
};

export const INITIAL_PARTS: Part[] = [
  // CHASSIS
  { id: 'ch-1', name: 'Scrap Frame', type: 'chassis', weight: 500, armor: 100, description: 'Basic heavy frame.', icon: 'layout' },
  { id: 'ch-2', name: 'Alloy Skiff', type: 'chassis', weight: 250, armor: 40, description: 'Light and fast.', icon: 'wind' },
  
  // WHEELS
  { id: 'wh-1', name: 'Spiked Tires', type: 'wheel', weight: 80, speed: 40, description: 'Good for dunes.', icon: 'circle' },
  { id: 'wh-2', name: 'Steel Treads', type: 'wheel', weight: 200, speed: 20, armor: 100, description: 'Tank style.', icon: 'layers' },

  // ENGINES
  { id: 'en-1', name: 'Rusty V6', type: 'engine', weight: 150, power: 100, description: 'Loud and smoky.', icon: 'zap' },
  { id: 'en-2', name: 'Twin Turbo', type: 'engine', weight: 100, power: 180, description: 'High performance.', icon: 'flame' },

  // WEAPONS
  { id: 'wp-1', name: 'Harpoon Gun', type: 'weapon', weight: 60, damage: 150, description: 'Precision hook.', icon: 'sword' },
  { id: 'wp-2', name: 'Auto-Cannon', type: 'weapon', weight: 120, damage: 250, description: 'Rapid fire.', icon: 'crosshair' },

  // ARMOR
  { id: 'ar-1', name: 'Iron Plate', type: 'armor', weight: 100, armor: 200, description: 'Solid protection.', icon: 'shield' },
  { id: 'ar-2', name: 'Reactive Pack', type: 'armor', weight: 50, armor: 100, description: 'Light explosive shield.', icon: 'shield-check' },
];
