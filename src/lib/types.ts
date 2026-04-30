import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Part {
  id: string;
  name: string;
  type: 'chassis' | 'wheel' | 'engine' | 'weapon' | 'armor';
  weight: number;
  power?: number;
  speed?: number;
  armor?: number;
  damage?: number;
  description: string;
  gridSize: { w: number; h: number };
  icon: string;
}

export interface PlacedPart extends Part {
  x: number;
  y: number;
  uniqueId: string;
}

export const INITIAL_PARTS: Part[] = [
  {
    id: 'chassis-rusty',
    name: 'Rusty Frame',
    type: 'chassis',
    weight: 500,
    armor: 100,
    description: 'A standard steel frame salvaged from an old truck.',
    gridSize: { w: 6, h: 3 },
    icon: 'layout-template'
  },
  {
    id: 'chassis-compact',
    name: 'Compact Tray',
    type: 'chassis',
    weight: 300,
    armor: 50,
    description: 'Lightweight but lacks structural integrity.',
    gridSize: { w: 4, h: 2 },
    icon: 'layout'
  },
  {
    id: 'wheel-junk',
    name: 'Junk Wheel',
    type: 'wheel',
    weight: 50,
    speed: 20,
    description: 'Mismatch tire bound with barbed wire.',
    gridSize: { w: 1, h: 1 },
    icon: 'circle'
  },
  {
    id: 'engine-v6',
    name: 'Smoky V6',
    type: 'engine',
    weight: 200,
    power: 80,
    description: 'Burns more oil than gas, but it roars.',
    gridSize: { w: 2, h: 2 },
    icon: 'zap'
  },
  {
    id: 'weapon-spikes',
    name: 'Scrap Spikes',
    type: 'weapon',
    weight: 30,
    damage: 40,
    description: 'Pointy bits welded to the front.',
    gridSize: { w: 1, h: 1 },
    icon: 'sword'
  },
  {
    id: 'weapon-turret',
    name: 'Makeshift Turret',
    type: 'weapon',
    weight: 150,
    damage: 100,
    description: 'An old machine gun mounted on a swiveling pipe.',
    gridSize: { w: 2, h: 2 },
    icon: 'crosshair'
  },
  {
    id: 'armor-plating',
    name: 'Iron Sheet',
    type: 'armor',
    weight: 100,
    armor: 150,
    description: 'Heavy industrial plating.',
    gridSize: { w: 2, h: 1 },
    icon: 'shield'
  }
];
