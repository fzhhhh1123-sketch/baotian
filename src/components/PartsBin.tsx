import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Part, PlacedPart, INITIAL_PARTS, cn } from '../lib/types';
import * as Icons from 'lucide-react';
import { generatePartLore } from '../services/geminiService';

interface PartsBinProps {
  onDragStart: (e: React.DragEvent, part: Part) => void;
}

export function PartsBin({ onDragStart }: PartsBinProps) {
  const [selectedCategory, setSelectedCategory] = useState<Part['type'] | 'all'>('all');
  const [lore, setLore] = useState<Record<string, string>>({});

  const filteredParts = INITIAL_PARTS.filter(p => selectedCategory === 'all' || p.type === selectedCategory);

  const categories: (Part['type'] | 'all')[] = ['all', 'chassis', 'wheel', 'engine', 'weapon', 'armor'];

  return (
    <div className="w-80 h-full flex flex-col bg-[#111111] overflow-hidden border-r border-[#333333]">
      <div className="p-4 border-b border-[#333333] bg-[#1A1A1A]">
        <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-white">Component Inventory</h2>
      </div>

      <div className="flex flex-wrap gap-1 p-4 bg-black/20">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-2 py-1 text-[8px] mono-label border border-[#333333] cursor-pointer transition-all",
              selectedCategory === cat ? "bg-[#FF9500] text-black border-[#FF9500]" : "hover:border-[#FF9500]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredParts.map(part => {
          const IconComponent = (Icons as any)[part.icon.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join('')] || Icons.HelpCircle;
          const isSelected = part.type === 'chassis'; // Example for visual flair
          
          return (
            <motion.div
              key={part.id}
              layoutId={part.id}
              draggable
              onDragStart={(e) => onDragStart(e, part)}
              onMouseEnter={async () => {
                if (!lore[part.id]) {
                  const text = await generatePartLore(part.name);
                  setLore(prev => ({ ...prev, [part.id]: text }));
                }
              }}
              className={cn(
                "group p-3 border-l-4 transition-all cursor-grab active:cursor-grabbing relative",
                isSelected ? "border-[#FF9500] bg-[#1a150e]" : "border-transparent bg-black/40 hover:border-[#444] hover:bg-[#1A1A1A]"
              )}
            >
              <div className="flex justify-between text-[10px] font-mono text-[#888] mb-1 uppercase">
                <span>{part.type}</span>
                <span>{part.weight}kg</span>
              </div>
              <div className="flex items-center gap-3">
                <IconComponent className={cn("w-4 h-4", isSelected ? "text-[#FF9500]" : "text-[#444]")} />
                <h3 className="font-bold text-white uppercase text-sm">{part.name}</h3>
              </div>
              
              <p className="mt-2 text-[10px] text-[#666] font-mono leading-tight italic">
                // {lore[part.id] || part.description}
              </p>

              {lore[part.id] && (
                <div className="absolute top-2 right-2">
                   <div className="w-1 h-1 rounded-full bg-[#FF9500] animate-pulse" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
