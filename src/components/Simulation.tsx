import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { Part } from '../lib/types';
import * as Icons from 'lucide-react';

interface SimulationProps {
  parts: Part[];
  onClose: () => void;
}

export function Simulation({ parts, onClose }: SimulationProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const [stats, setStats] = useState({ distance: 0, speed: 0, kills: 0 });
  const controlsRef = useRef({ left: false, right: false, fire: false });

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
        background: '#0D0D0D',
      },
    });
    renderRef.current = render;

    // Ground
    const ground = Matter.Bodies.rectangle(10000, 580, 20000, 40, { 
      isStatic: true, 
      friction: 1,
      render: { fillStyle: '#111' },
      label: 'ground'
    });
    Matter.World.add(world, ground);

    // Vehicle
    const composite = Matter.Composite.create();
    const chassis = parts.find(p => p.type === 'chassis');
    const enginePart = parts.find(p => p.type === 'engine');
    const weapon = parts.find(p => p.type === 'weapon');
    const wheels: Matter.Body[] = [];

    let chassisBody: Matter.Body | null = null;

    if (chassis) {
      chassisBody = Matter.Bodies.rectangle(400, 400, 140, 60, {
        mass: chassis.weight / 10,
        friction: 0.5,
        render: { fillStyle: '#FF9500' },
        label: 'vehicle'
      });
      Matter.Composite.add(composite, chassisBody);

      // Wheels
      [ -50, 50 ].forEach(x => {
        const wBody = Matter.Bodies.circle(400 + x, 430, 28, {
          friction: 1,
          restitution: 0.2,
          render: { fillStyle: '#fff' },
          label: 'wheel'
        });
        wheels.push(wBody);
        Matter.Composite.add(composite, wBody);
        Matter.Composite.add(composite, Matter.Constraint.create({
          bodyA: chassisBody!, bodyB: wBody, stiffness: 0.1, length: 10, pointA: { x, y: 30 }
        }));
      });
    }

    // Enemies (Zombies)
    const enemies: Matter.Body[] = [];
    for (let i = 0; i < 50; i++) {
       const z = Matter.Bodies.rectangle(1000 + i * 400 + Math.random() * 200, 500, 30, 60, {
         render: { fillStyle: '#4ADE80' },
         label: 'zombie',
         friction: 0.1
       });
       enemies.push(z);
    }
    Matter.World.add(world, enemies);

    Matter.World.add(world, composite);
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    // Input handling
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'ArrowLeft') controlsRef.current.left = true;
      if (e.key === 'd' || e.key === 'ArrowRight') controlsRef.current.right = true;
      if (e.key === ' ') controlsRef.current.fire = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'ArrowLeft') controlsRef.current.left = false;
      if (e.key === 'd' || e.key === 'ArrowRight') controlsRef.current.right = false;
      if (e.key === ' ') controlsRef.current.fire = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // projectiles
    const projectiles: Matter.Body[] = [];
    let lastFire = 0;

    const gameLoop = () => {
      if (!chassisBody) return;

      // Apply forces based on controls
      if (controlsRef.current.right) {
        wheels.forEach(w => Matter.Body.setAngularVelocity(w, 0.3 * (enginePart?.power ? 1.5 : 1)));
      } else if (controlsRef.current.left) {
        wheels.forEach(w => Matter.Body.setAngularVelocity(w, -0.3));
      }

      // Fire weapon
      if (controlsRef.current.fire && weapon && Date.now() - lastFire > 300) {
        const bullet = Matter.Bodies.rectangle(chassisBody.position.x + 80, chassisBody.position.y - 10, 20, 5, {
          render: { fillStyle: '#FF9500' },
          label: 'projectile'
        });
        Matter.Body.setVelocity(bullet, { x: 25, y: -2 });
        Matter.World.add(world, bullet);
        projectiles.push(bullet);
        lastFire = Date.now();
      }

      // Collision Check for Kills
      Matter.Events.on(engine, 'collisionStart', (event) => {
        event.pairs.forEach(pair => {
          if (pair.bodyA.label === 'projectile' && pair.bodyB.label === 'zombie') {
            Matter.World.remove(world, pair.bodyB);
            setStats(s => ({...s, kills: s.kills + 1}));
          } else if (pair.bodyB.label === 'projectile' && pair.bodyA.label === 'zombie') {
            Matter.World.remove(world, pair.bodyA);
            setStats(s => ({...s, kills: s.kills + 1}));
          }
        });
      });

      Matter.Render.lookAt(render, {
        min: { x: chassisBody.position.x - 400, y: 0 },
        max: { x: chassisBody.position.x + 400, y: 600 }
      });

      setStats(prev => ({
        ...prev,
        distance: Math.floor(chassisBody!.position.x / 100),
        speed: Math.floor(Math.abs(chassisBody!.velocity.x) * 10)
      }));

      requestAnimationFrame(gameLoop);
    };

    const animId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      Matter.Engine.clear(engine);
      Matter.Render.stop(render);
      Matter.World.clear(world, false);
      cancelAnimationFrame(animId);
      if (render.canvas) render.canvas.remove();
    };
  }, [parts]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="p-6 bg-[#0D0D0D] border-b border-[#333] flex justify-between items-center h-24">
        <div className="flex gap-12">
          <div>
             <span className="mono-label block mb-1">TRAVEL DISTANCE</span>
             <div className="text-3xl font-black text-[#FF9500] leading-none text-right">{stats.distance}M</div>
          </div>
          <div>
             <span className="mono-label block mb-1">VELOCITY</span>
             <div className="text-3xl font-black text-white leading-none text-right">{stats.speed}KM/H</div>
          </div>
          <div>
             <span className="mono-label block mb-1">WASTE KILLS</span>
             <div className="text-3xl font-black text-[#4ADE80] leading-none text-right">{stats.kills}</div>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="text-[10px] mono-label max-w-[200px] leading-tight opacity-50">
             [A/D] MOVE<br/>
             [SPACE] FIRE WEAPON
           </div>
           <button onClick={onClose} className="h-12 px-8 bg-white text-black font-black uppercase skew-x-[-10deg] hover:bg-[#FF9500] transition-all">
             RETURN TO GARAGE
           </button>
        </div>
      </div>
      <div ref={sceneRef} className="flex-1 w-full relative" />
    </div>
  );
}
