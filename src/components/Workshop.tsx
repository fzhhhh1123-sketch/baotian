import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Part, PlacedPart, cn } from '../lib/types';
import * as Icons from 'lucide-react';

interface WorkshopProps {
  placedParts: PlacedPart[];
  onPlacePart: (part: Part, x: number, y: number) => void;
  onRemovePart: (uniqueId: string) => void;
}

const GRID_SIZE = 40;
const CANVAS_W = 16;
const CANVAS_H = 10;

export function Workshop({ placedParts, onPlacePart, onRemovePart }: WorkshopProps) {
  const [draggedPart, setDraggedPart] = useState<Part | null>(null);
  const [hoverGrid, setHoverGrid] = useState<{ x: number, y: number } | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / GRID_SIZE);
    const y = Math.floor((e.clientY - rect.top) / GRID_SIZE);
    setHoverGrid({ x, y });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const partData = e.dataTransfer.getData('application/json');
    if (!partData) return;
    
    const part = JSON.parse(partData) as Part;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / GRID_SIZE);
    const y = Math.floor((e.clientY - rect.top) / GRID_SIZE);

    // Basic bounds check
    if (x + part.gridSize.w <= CANVAS_W && y + part.gridSize.h <= CANVAS_H) {
      onPlacePart(part, x, y);
    }
    setHoverGrid(null);
  };

  return (
    <div className="flex-1 h-full flex flex-col relative overflow-hidden bg-[#0D0D0D] pb-32">
      {/* Decorative Background Number */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[500px] font-black text-white/5 select-none pointer-events-none leading-none z-0 tracking-tighter">
        004
      </div>

      {/* Assembly Grid */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div 
          className="workshop-grid relative border-4 border-[#1A1A1A] shadow-[0_0_100px_rgba(0,0,0,0.8)]"
          style={{ width: CANVAS_W * GRID_SIZE, height: CANVAS_H * GRID_SIZE }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeave={() => setHoverGrid(null)}
        >
          {/* Centered Circle Decoration from Theme */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
             <div className="w-[400px] h-[400px] border border-dashed border-[#FF9500] rounded-full"></div>
          </div>

          {/* Grid Labels */}
          <div className="absolute -top-10 left-0 flex w-full">
             {Array.from({length: CANVAS_W}).map((_, i) => (
               <span key={i} className="flex-1 text-center mono-label text-[8px]">{i < 10 ? `0${i}` : i}</span>
             ))}
          </div>

          {/* Placed Parts */}
          {placedParts.map((part) => {
            const IconComponent = (Icons as any)[part.icon.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join('')] || Icons.HelpCircle;
            
            return (
              <motion.div
                key={part.uniqueId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "absolute flex flex-col items-center justify-center p-1 group z-20 transition-all",
                  "bg-[#1A1A1A] border-2 border-[#333333] hover:border-[#FF9500] cursor-pointer shadow-xl"
                )}
                style={{
                  left: part.x * GRID_SIZE,
                  top: part.y * GRID_SIZE,
                  width: part.gridSize.w * GRID_SIZE,
                  height: part.gridSize.h * GRID_SIZE,
                }}
                onClick={() => onRemovePart(part.uniqueId)}
              >
                <div className="flex-1 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                  <IconComponent className="w-8 h-8 text-[#FF9500]" />
                </div>
                <div className="absolute -top-1 -right-1 hidden group-hover:block bg-red-600 p-0.5">
                   <Icons.X className="w-2 h-2 text-white" />
                </div>
                <span className="mono-label text-[6px] absolute bottom-1 left-2 opacity-50 tracking-tighter whitespace-nowrap overflow-hidden w-full text-center px-1 font-mono">{part.name}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Heavy Action Bar from Theme */}
      <footer className="h-24 bg-[#FF9500] flex items-center px-8 border-t-8 border-[#0D0D0D] absolute bottom-0 left-0 right-0 z-40">
        <div className="flex-1">
          <div className="text-black font-black text-4xl uppercase italic leading-none">Ready to Roll</div>
          <div className="text-black font-mono text-[8px] font-bold uppercase opacity-60 mt-1 tracking-widest">Auto-syncing configuration to wasteland grid...</div>
        </div>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('START_TEST_DRIVE'))}
          className="h-16 px-12 bg-black text-white font-black text-xl uppercase tracking-tighter skew-x-[-10deg] hover:bg-white hover:text-black transition-colors"
        >
          Initiate Assembly
        </button>
      </footer>
    </div>
  );
}
