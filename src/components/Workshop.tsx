import React from 'react';
import { EquippedParts, SlotType, cn } from '../lib/types';
import * as Icons from 'lucide-react';

interface WorkshopProps {
  equipment: EquippedParts;
  onRemove: (type: SlotType) => void;
}

const SLOTS: { type: SlotType; label: string; x: string; y: string }[] = [
  { type: 'chassis', label: 'CORE / CHASSIS', x: '50%', y: '50%' },
  { type: 'engine', label: 'POWER / ENGINE', x: '25%', y: '45%' },
  { type: 'weapon', label: 'OFFENSE / WEAPON', x: '75%', y: '35%' },
  { type: 'wheel', label: 'DRIVE / WHEELS', x: '50%', y: '75%' },
  { type: 'armor', label: 'DEFENSE / ARMOR', x: '50%', y: '25%' },
];

export function Workshop({ equipment, onRemove }: WorkshopProps) {
  const totalWeight = Object.values(equipment).reduce((acc, p) => acc + (p?.weight || 0), 0);
  const totalPower = equipment.engine?.power || 0;

  return (
    <div className="flex-1 h-full flex flex-col relative overflow-hidden bg-[#0D0D0D] pb-32">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[400px] font-black text-white/5 select-none pointer-events-none leading-none z-0 tracking-tighter">
        AUTO
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10 p-20">
        <div className="relative w-full h-full max-w-4xl max-h-[500px]">
          {/* Schematic Backdrop */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
             <div className="w-[600px] h-[600px] border border-dashed border-[#FF9500] rounded-full scale-75"></div>
          </div>

          {/* Slot Indicators */}
          {SLOTS.map((slot) => {
            const part = equipment[slot.type];
            const IconComponent = part 
              ? (Icons as any)[part.icon.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join('')] || Icons.HelpCircle
              : Icons.Plus;

            return (
              <div 
                key={slot.type}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
                style={{ left: slot.x, top: slot.y }}
              >
                <div 
                  onClick={() => part && onRemove(slot.type)}
                  className={cn(
                    "w-20 h-20 border-2 flex items-center justify-center transition-all cursor-pointer relative",
                    part 
                      ? "border-[#FF9500] bg-[#1a150e] shadow-[0_0_20px_rgba(255,149,0,0.2)]" 
                      : "border-[#333] border-dashed hover:border-[#444] bg-black/40"
                  )}
                >
                  <IconComponent className={cn("w-8 h-8", part ? "text-[#FF9500]" : "text-[#333]")} />
                  {part && (
                    <div className="absolute -top-1 -right-1 bg-red-600 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icons.X className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <span className="mono-label text-[8px] block opacity-40">{slot.label}</span>
                  <span className="text-white font-bold text-[10px] uppercase truncate max-w-[120px] block">
                    {part?.name || 'Empty Slot'}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Decorative Lines Connecting (Simple SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
             <line x1="25%" y1="45%" x2="50%" y2="50%" stroke="#FF9500" strokeWidth="1" strokeDasharray="4" />
             <line x1="75%" y1="35%" x2="50%" y2="50%" stroke="#FF9500" strokeWidth="1" strokeDasharray="4" />
             <line x1="50%" y1="75%" x2="50%" y2="50%" stroke="#FF9500" strokeWidth="1" strokeDasharray="4" />
             <line x1="50%" y1="25%" x2="50%" y2="50%" stroke="#FF9500" strokeWidth="1" strokeDasharray="4" />
          </svg>
        </div>
      </div>

      {/* Stats Overlay */}
      <div className="absolute top-8 right-8 flex flex-col gap-4 text-right">
        <div>
          <span className="mono-label block mb-1 text-[10px] uppercase tracking-widest text-[#888]">TOTAL MASS</span>
          <span className="text-2xl font-black text-white">{totalWeight} <small className="text-[#FF9500]">KG</small></span>
        </div>
        <div>
          <span className="mono-label block mb-1 text-[10px] uppercase tracking-widest text-[#888]">OUTPUT</span>
          <span className="text-2xl font-black text-white">{totalPower} <small className="text-[#FF9500]">KW</small></span>
        </div>
      </div>

      {/* Action Bar */}
      <footer className="h-24 bg-[#FF9500] flex items-center px-8 border-t-8 border-[#0D0D0D] absolute bottom-0 left-0 right-0 z-40">
        <div className="flex-1">
          <div className="text-black font-black text-4xl uppercase italic leading-none">Ready to Roll</div>
          <div className="text-black font-mono text-[8px] font-bold uppercase opacity-60 mt-1 tracking-widest">Auto-syncing configuration to wasteland grid...</div>
        </div>
        <button 
          disabled={!equipment.chassis || !equipment.wheel || !equipment.engine}
          onClick={() => window.dispatchEvent(new CustomEvent('START_TEST_DRIVE'))}
          className="h-16 px-12 bg-black text-white font-black text-xl uppercase tracking-tighter skew-x-[-10deg] hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {(!equipment.chassis || !equipment.wheel || !equipment.engine) ? 'INCOMPLETE UNIT' : 'INITIATE ASSEMBLY'}
        </button>
      </footer>
    </div>
  );
}
