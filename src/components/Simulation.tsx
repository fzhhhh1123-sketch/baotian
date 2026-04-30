import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { PlacedPart } from '../lib/types';
import * as Icons from 'lucide-react';

interface SimulationProps {
  parts: PlacedPart[];
  onClose: () => void;
}

export function Simulation({ parts, onClose }: SimulationProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const [stats, setStats] = useState({ distance: 0, speed: 0, maxSpeed: 0 });

  useEffect(() => {
    if (!sceneRef.current) return;

    const engine = Matter.Engine.create();
    const world = engine.world;
    engineRef.current = engine;

    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: sceneRef.current.clientWidth,
        height: sceneRef.current.clientHeight,
        wireframes: false,
        background: '#0c0d0e',
      },
    });
    renderRef.current = render;

    // Ground - endless floor
    const ground = Matter.Bodies.rectangle(4000, 580, 8000, 40, { 
      isStatic: true, 
      render: { fillStyle: '#1a1b1e' }
    });
    
    // Create Obstacles
    const obstacles = Array.from({ length: 20 }).map((_, i) => (
      Matter.Bodies.rectangle(1000 + i * 800, 540, 60, 40, { 
        render: { fillStyle: '#2a2c30' } 
      })
    ));

    Matter.World.add(world, [ground, ...obstacles]);

    // Construct Vehicle
    const composite = Matter.Composite.create();
    
    // Find chassis components
    const chassisParts = parts.filter(p => p.type === 'chassis');
    const wheelParts = parts.filter(p => p.type === 'wheel');
    const otherParts = parts.filter(p => p.type !== 'chassis' && p.type !== 'wheel');

    const bodiesMap = new Map<string, Matter.Body>();

    // 1. Create Chassis Blocks
    chassisParts.forEach(p => {
      const body = Matter.Bodies.rectangle(
        400 + p.x * 20, 
        400 + p.y * 20, 
        p.gridSize.w * 20, 
        p.gridSize.h * 20, 
        { 
          mass: p.weight / 100,
          render: { fillStyle: '#f27d26' }
        }
      );
      bodiesMap.set(p.uniqueId, body);
      Matter.Composite.add(composite, body);
    });

    // 2. Add other parts (weapons, engines) fixed to chassis
    otherParts.forEach(p => {
      // Find nearest chassis part to attach to
      const parent = chassisParts[0]; // Simplification
      if (parent) {
        const body = Matter.Bodies.rectangle(
          400 + p.x * 20, 
          400 + p.y * 20, 
          p.gridSize.w * 20, 
          p.gridSize.h * 20, 
          { 
            mass: p.weight / 100,
            render: { fillStyle: '#8e9299' }
          }
        );
        bodiesMap.set(p.uniqueId, body);
        Matter.Composite.add(composite, body);
        
        // Weld to chassis
        const constraint = Matter.Constraint.create({
          bodyA: bodiesMap.get(parent.uniqueId),
          bodyB: body,
          pointA: { x: (p.x - parent.x) * 20, y: (p.y - parent.y) * 20 },
          stiffness: 1,
          length: 0
        });
        Matter.Composite.add(composite, constraint);
      }
    });

    // 3. Add Wheels
    wheelParts.forEach(p => {
      const parent = chassisParts[0];
      if (parent) {
        const wheel = Matter.Bodies.circle(
          400 + p.x * 20 + 10, 
          400 + (p.y + 1) * 20, 
          15, 
          { 
            friction: 0.9,
            restitution: 0.5,
            render: { fillStyle: '#ffffff' }
          }
        );
        Matter.Composite.add(composite, wheel);

        const constraint = Matter.Constraint.create({
          bodyA: bodiesMap.get(parent.uniqueId),
          bodyB: wheel,
          pointA: { x: (p.x - parent.x) * 20 + 10, y: (p.y - parent.y) * 20 + 20 },
          stiffness: 0.3,
          length: 5,
          render: { visible: true, strokeStyle: '#2a2c30' }
        });
        Matter.Composite.add(composite, constraint);

        // Apply engine power
        const powerIndex = parts.reduce((acc, p) => acc + (p.power || 0), 0);
        setInterval(() => {
          Matter.Body.setAngularVelocity(wheel, 0.15 + (powerIndex / 1000));
        }, 100);
      }
    });

    Matter.World.add(world, composite);

    // Runner
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    // Camera follow (simplified)
    const updateStats = () => {
      const mainChassis = bodiesMap.get(chassisParts[0]?.uniqueId || '');
      if (mainChassis) {
        Matter.Render.lookAt(render, {
          min: { x: mainChassis.position.x - 400, y: 0 },
          max: { x: mainChassis.position.x + 400, y: 600 }
        });
        
        setStats(prev => ({
          distance: Math.floor(mainChassis.position.x / 100),
          speed: Math.floor(mainChassis.velocity.x * 10),
          maxSpeed: Math.max(prev.maxSpeed, Math.floor(mainChassis.velocity.x * 10))
        }));
      }
      requestAnimationFrame(updateStats);
    };
    const reqId = requestAnimationFrame(updateStats);

    return () => {
      Matter.Engine.clear(engine);
      Matter.Render.stop(render);
      Matter.World.clear(world, false);
      cancelAnimationFrame(reqId);
      if (render.canvas) render.canvas.remove();
    };
  }, [parts]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="p-4 bg-[#151619] border-b border-[#2a2c30] flex justify-between items-center">
        <div className="flex gap-8">
          <div>
             <span className="mono-label">DISTANCE</span>
             <div className="text-2xl font-mono text-[#f27d26]">{stats.distance}M</div>
          </div>
          <div>
             <span className="mono-label">SPEED</span>
             <div className="text-2xl font-mono text-[#f27d26]">{stats.speed}KM/H</div>
          </div>
          <div>
             <span className="mono-label">MAX SPEED</span>
             <div className="text-2xl font-mono text-white">{stats.maxSpeed}KM/H</div>
          </div>
        </div>
        <button onClick={onClose} className="btn-outline flex items-center gap-2">
          <Icons.ChevronLeft /> BACK TO GARAGE
        </button>
      </div>

      <div ref={sceneRef} className="flex-1 w-full relative">
        <div className="absolute top-4 left-4 bg-black/60 p-3 border border-[#2a2c30] text-[10px] mono-label">
           SIMULATION RUNNING... AUTO-THRUST ENGAGED
        </div>
      </div>
    </div>
  );
}
