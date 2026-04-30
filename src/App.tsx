import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { PartsBin } from './components/PartsBin';
import { Workshop } from './components/Workshop';
import { Simulation } from './components/Simulation';
import { Part, PlacedPart } from './lib/types';
import * as Icons from 'lucide-react';

export default function App() {
  const [placedParts, setPlacedParts] = useState<PlacedPart[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const handlePlacePart = (part: Part, x: number, y: number) => {
    const newPlacedPart: PlacedPart = {
      ...part,
      x,
      y,
      uniqueId: Math.random().toString(36).substr(2, 9)
    };
    setPlacedParts(prev => [...prev, newPlacedPart]);
  };

  const handleRemovePart = (uniqueId: string) => {
    setPlacedParts(prev => prev.filter(p => p.uniqueId !== uniqueId));
  };

  const handleDragStart = (e: React.DragEvent, part: Part) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('application/json', JSON.stringify(part));
    }
  };

  useEffect(() => {
    const handleStartTest = () => setIsSimulating(true);
    window.addEventListener('START_TEST_DRIVE' as any, handleStartTest);
    return () => window.removeEventListener('START_TEST_DRIVE' as any, handleStartTest);
  }, []);

  if (showIntro) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0D0D0D] flex items-center justify-center p-6 text-center border-[20px] border-[#1A1A1A]">
        <div className="max-w-xl">
           <h1 className="text-9xl font-black italic tracking-tighter uppercase mb-4 text-white leading-[0.8]">
             WASTE<br/>
             <span className="text-[#FF9500]">CRAFTER</span>
           </h1>
           <p className="mono-label mb-8">System Booting // Sector 04 // Scavenging complete...</p>
           <p className="text-sm leading-relaxed mb-12 text-[#E0E0E0]/80 font-medium uppercase tracking-tight max-w-sm mx-auto">
             The world ended, but the race never stops. Assemble your combat vehicle from salvaged components. 
           </p>
           <button 
             onClick={() => setShowIntro(false)}
             className="btn-waste px-16 py-8"
           >
             ENGAGE GARAGE
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0D0D0D] border-8 border-[#1A1A1A] overflow-hidden">
      {/* Top Navbar */}
      <header className="h-20 border-b border-[#333333] bg-[#0D0D0D] flex items-center justify-between px-8 z-40">
        <div className="flex flex-col">
          <span className="mono-label text-[8px] mb-1">Sector-04 // Maintenance Bay</span>
          <div className="flex items-center gap-3">
            <span className="font-black italic tracking-tighter text-3xl uppercase text-white leading-none">
              WASTELAND <span className="text-[#FF9500]">ASSEMBLER</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-10">
          <div className="text-right">
             <span className="mono-label block mb-1">SCRAP BALANCE</span>
             <span className="text-3xl font-black text-white">12,450<span className="text-[#FF9500] text-sm ml-1 uppercase">kg</span></span>
          </div>
          <div className="h-10 w-[1px] bg-[#333333]" />
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#4ADE80] animate-pulse shadow-[0_0_10px_#4ADE80]" />
            <span className="mono-label">Sync Active</span>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden">
        <PartsBin onDragStart={handleDragStart} />
        <Workshop 
          placedParts={placedParts} 
          onPlacePart={handlePlacePart} 
          onRemovePart={handleRemovePart}
        />
      </main>

      {/* Simulation Overlay */}
      <AnimatePresence>
        {isSimulating && (
          <Simulation parts={placedParts} onClose={() => setIsSimulating(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
