import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Eye, ShieldAlert, Zap, Compass, Info } from 'lucide-react';
import { sfx } from '../utils/audio';

interface SimulationObject {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  isPossessed: boolean;
  type: 'vase' | 'crate' | 'clock' | 'statue';
  color: string;
}

interface Guard {
  id: string;
  x: number;
  y: number;
  angle: number;
  patrolIndex: number;
  state: 'PATROL' | 'SUSPICIOUS' | 'STUNNED';
  stateTimer: number; // seconds remaining
  alertPos: { x: number; y: number } | null;
  speed: number;
}

interface Waypoint {
  x: number;
  y: number;
}

// Ray-box line of sight occlusion test
function lineIntersectsWall(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  wall: { x: number; y: number; w: number; h: number }
): boolean {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  if (maxX < wall.x || minX > wall.x + wall.w || maxY < wall.y || minY > wall.y + wall.h) {
    return false;
  }

  let t0 = 0.0;
  let t1 = 1.0;
  const dx = x2 - x1;
  const dy = y2 - y1;

  const p = [-dx, dx, -dy, dy];
  const q = [x1 - wall.x, wall.x + wall.w - x1, y1 - wall.y, wall.y + wall.h - y1];

  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) {
        if (t > t1) return false;
        if (t > t0) t0 = t;
      } else {
        if (t < t0) return false;
        if (t < t1) t1 = t;
      }
    }
  }
  return t0 <= t1;
}

export const PlayableSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game / Physics State
  const [panicMeter, setPanicMeter] = useState<number>(0);
  const [isLockdown, setIsLockdown] = useState<boolean>(false);
  const [isPossessing, setIsPossessing] = useState<boolean>(false);
  const [possessedName, setPossessedName] = useState<string>('None');
  const [objectSpeed, setObjectSpeed] = useState<number>(0);
  const [guardStatus, setGuardStatus] = useState<string>('Patrolling');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showDebug, setShowDebug] = useState<boolean>(false);

  // References for continuous 60fps loop without state desync
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const mousePos = useRef<{ x: number; y: number }>({ x: 500, y: 340 });

  const ghostPos = useRef<{ x: number; y: number; vx: number; vy: number }>({
    x: 120,
    y: 130,
    vx: 0,
    vy: 0,
  });

  const cameraPos = useRef<{ x: number; y: number }>({ x: 500, y: 340 });

  // Expanded collection of possessable museum props
  const initialObjects: SimulationObject[] = [
    { id: '1', name: 'Ceramic Vase', x: 130, y: 190, vx: 0, vy: 0, radius: 18, mass: 1.0, isPossessed: false, type: 'vase', color: '#6ee7b7' },
    { id: '2', name: 'Heavy Oak Crate', x: 160, y: 480, vx: 0, vy: 0, radius: 24, mass: 2.5, isPossessed: false, type: 'crate', color: '#d97706' },
    { id: '3', name: 'Haunted Clock', x: 390, y: 130, vx: 0, vy: 0, radius: 22, mass: 1.8, isPossessed: false, type: 'clock', color: '#c084fc' },
    { id: '4', name: 'Marble Statue', x: 370, y: 520, radius: 28, vx: 0, vy: 0, mass: 3.2, isPossessed: false, type: 'statue', color: '#94a3b8' },
    { id: '5', name: 'Relic Urn', x: 620, y: 150, vx: 0, vy: 0, radius: 20, mass: 1.2, isPossessed: false, type: 'vase', color: '#38bdf8' },
    { id: '6', name: 'Suit of Armor', x: 620, y: 480, vx: 0, vy: 0, radius: 26, mass: 3.0, isPossessed: false, type: 'statue', color: '#cbd5e1' },
    { id: '7', name: 'Treasure Chest', x: 860, y: 140, vx: 0, vy: 0, radius: 24, mass: 2.3, isPossessed: false, type: 'crate', color: '#f59e0b' },
    { id: '8', name: 'Cursed Bust', x: 870, y: 500, vx: 0, vy: 0, radius: 20, mass: 1.4, isPossessed: false, type: 'vase', color: '#e879f9' },
  ];

  const objectsRef = useRef<SimulationObject[]>(JSON.parse(JSON.stringify(initialObjects)));

  // Guard patrol waypoints looping through corridors and doorways
  const waypoints = useRef<Waypoint[]>([
    { x: 360, y: 280 }, // West Doorway
    { x: 380, y: 160 }, // Upper Grand Hallway
    { x: 630, y: 140 }, // Upper Exhibit
    { x: 670, y: 310 }, // East Archive Doorway
    { x: 630, y: 500 }, // Lower Exhibit
    { x: 380, y: 490 }, // Lower Grand Hallway
  ]);

  const guardRef = useRef<Guard>({
    id: 'guard-1',
    x: 360,
    y: 280,
    angle: 0,
    patrolIndex: 0,
    state: 'PATROL',
    stateTimer: 0,
    alertPos: null,
    speed: 75,
  });

  // Walls / Obstacles in room (Increased map size: 1000 x 680 with interior walls)
  const walls = useRef<Array<{ x: number; y: number; w: number; h: number }>>([
    // Outer boundaries (1000x680 canvas, 30px border margin)
    { x: 30, y: 30, w: 940, h: 18 },  // Top boundary
    { x: 30, y: 632, w: 940, h: 18 }, // Bottom boundary
    { x: 30, y: 30, w: 18, h: 620 },  // Left boundary
    { x: 952, y: 30, w: 18, h: 620 }, // Right boundary

    // Interior dividing walls & pillars (like existing charcoal/slate ones)
    // 1. West Gallery dividing walls (doorway in middle)
    { x: 260, y: 48, w: 18, h: 180 },
    { x: 260, y: 380, w: 18, h: 252 },
    { x: 80, y: 330, w: 120, h: 18 }, // West gallery corner baffle

    // 2. Central Hall dividing pillars & partitions
    { x: 480, y: 120, w: 18, h: 160 },
    { x: 480, y: 390, w: 18, h: 160 },
    { x: 550, y: 280, w: 140, h: 18 }, // Central display divider

    // 3. East Archive / Vault dividing walls (doorway in middle)
    { x: 740, y: 48, w: 18, h: 180 },
    { x: 740, y: 380, w: 18, h: 252 },
    { x: 830, y: 250, w: 122, h: 18 }, // Vault alcove divider
  ]);

  // Particles for ghost trail & momentum launches
  const particles = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number }>>([]);

  const hoveredObjectId = useRef<string | null>(null);

  const resetGame = useCallback(() => {
    setPanicMeter(0);
    setIsLockdown(false);
    setIsPossessing(false);
    setPossessedName('None');
    setObjectSpeed(0);
    setGuardStatus('Patrolling');

    ghostPos.current = { x: 120, y: 130, vx: 0, vy: 0 };
    objectsRef.current = JSON.parse(JSON.stringify(initialObjects));
    guardRef.current = {
      id: 'guard-1',
      x: 360,
      y: 280,
      angle: 0,
      patrolIndex: 0,
      state: 'PATROL',
      stateTimer: 0,
      alertPos: null,
      speed: 75,
    };
    particles.current = [];
  }, []);

  // Handle Input events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;

      // Spacebar momentum launch when possessing
      if (e.code === 'Space') {
        e.preventDefault();
        const possessed = objectsRef.current.find((o) => o.isPossessed);
        if (possessed && !isLockdown) {
          // Launch impulse in current moving direction or toward mouse
          let dirX = 0;
          let dirY = 0;
          if (keysPressed.current['w'] || keysPressed.current['arrowup']) dirY -= 1;
          if (keysPressed.current['s'] || keysPressed.current['arrowdown']) dirY += 1;
          if (keysPressed.current['a'] || keysPressed.current['arrowleft']) dirX -= 1;
          if (keysPressed.current['d'] || keysPressed.current['arrowright']) dirX += 1;

          if (dirX === 0 && dirY === 0) {
            const currentSpeed = Math.hypot(possessed.vx, possessed.vy);
            if (currentSpeed > 10) {
              dirX = possessed.vx / currentSpeed;
              dirY = possessed.vy / currentSpeed;
            } else {
              const dx = mousePos.current.x - possessed.x;
              const dy = mousePos.current.y - possessed.y;
              const dist = Math.hypot(dx, dy) || 1;
              dirX = dx / dist;
              dirY = dy / dist;
            }
          } else {
            const len = Math.hypot(dirX, dirY) || 1;
            dirX /= len;
            dirY /= len;
          }

          // Apply Impulse (Godot 4 apply_central_impulse)
          const impulseMagnitude = 520 / possessed.mass;
          possessed.vx += dirX * impulseMagnitude;
          possessed.vy += dirY * impulseMagnitude;

          sfx.playLaunch();

          // Spawn burst particles
          for (let i = 0; i < 16; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 180 + 60;
            particles.current.push({
              x: possessed.x,
              y: possessed.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 0.4 + Math.random() * 0.3,
              maxLife: 0.7,
              color: '#00f3ff',
              size: 4 + Math.random() * 3,
            });
          }
        }
      }

      // Unpossess key: 'Q' or 'Escape'
      if (e.key.toLowerCase() === 'q' || e.key === 'Escape') {
        const possessed = objectsRef.current.find((o) => o.isPossessed);
        if (possessed) {
          possessed.isPossessed = false;
          setIsPossessing(false);
          setPossessedName('None');
          ghostPos.current.x = possessed.x + 24;
          ghostPos.current.y = possessed.y - 20;
          ghostPos.current.vx = 0;
          ghostPos.current.vy = 0;
        }
      }

      // Quick Restart key: 'R'
      if (e.key.toLowerCase() === 'r') {
        resetGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isLockdown, resetGame]);

  // Click on Canvas to Possess or Unpossess
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isLockdown) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Check if clicked an object within possession reach
    const targetObj = objectsRef.current.find((obj) => {
      const d = Math.hypot(obj.x - clickX, obj.y - clickY);
      return d <= obj.radius + 15;
    });

    if (targetObj) {
      if (targetObj.isPossessed) {
        // Unpossess
        targetObj.isPossessed = false;
        setIsPossessing(false);
        setPossessedName('None');
        ghostPos.current.x = targetObj.x + 20;
        ghostPos.current.y = targetObj.y;
      } else {
        // Possess new object
        objectsRef.current.forEach((o) => (o.isPossessed = false));
        targetObj.isPossessed = true;
        setIsPossessing(true);
        setPossessedName(targetObj.name);
        sfx.playPossess();

        // Particles
        for (let i = 0; i < 20; i++) {
          const a = Math.random() * Math.PI * 2;
          const spd = Math.random() * 80 + 20;
          particles.current.push({
            x: targetObj.x,
            y: targetObj.y,
            vx: Math.cos(a) * spd,
            vy: Math.sin(a) * spd,
            life: 0.5,
            maxLife: 0.5,
            color: '#00f3ff',
            size: 3,
          });
        }
      }
    } else if (isPossessing) {
      // Clicking empty space unpossesses
      const currentlyPossessed = objectsRef.current.find((o) => o.isPossessed);
      if (currentlyPossessed) {
        currentlyPossessed.isPossessed = false;
        setIsPossessing(false);
        setPossessedName('None');
        ghostPos.current.x = currentlyPossessed.x + 20;
        ghostPos.current.y = currentlyPossessed.y;
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const my = ((e.clientY - rect.top) / rect.height) * canvas.height;
    mousePos.current = { x: mx, y: my };

    // Update hovered object
    const hovered = objectsRef.current.find((obj) => {
      const d = Math.hypot(obj.x - mx, obj.y - my);
      return d <= obj.radius + 15;
    });
    hoveredObjectId.current = hovered ? hovered.id : null;
  };

  // Main 60 FPS Physics & Render Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05); // Cap delta time
      lastTime = currentTime;

      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameId = requestAnimationFrame(loop);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. UPDATE PHYSICS (If not paused by Lockdown)
      if (!isLockdown) {
        // Update Ghost / Possessed input
        let inputX = 0;
        let inputY = 0;
        if (keysPressed.current['w'] || keysPressed.current['arrowup']) inputY -= 1;
        if (keysPressed.current['s'] || keysPressed.current['arrowdown']) inputY += 1;
        if (keysPressed.current['a'] || keysPressed.current['arrowleft']) inputX -= 1;
        if (keysPressed.current['d'] || keysPressed.current['arrowright']) inputX += 1;

        if (inputX !== 0 && inputY !== 0) {
          inputX *= 0.7071;
          inputY *= 0.7071;
        }

        const possessedObj = objectsRef.current.find((o) => o.isPossessed);

        if (!possessedObj) {
          // Normal Ghost Movement: WASD float
          const ghostSpeed = 220;
          ghostPos.current.vx = inputX * ghostSpeed;
          ghostPos.current.vy = inputY * ghostSpeed;
          ghostPos.current.x = Math.max(52, Math.min(948, ghostPos.current.x + ghostPos.current.vx * dt));
          ghostPos.current.y = Math.max(52, Math.min(628, ghostPos.current.y + ghostPos.current.vy * dt));

          // Ghost particle trail
          if (Math.random() < 0.4) {
            particles.current.push({
              x: ghostPos.current.x + (Math.random() - 0.5) * 12,
              y: ghostPos.current.y + (Math.random() - 0.5) * 12,
              vx: (Math.random() - 0.5) * 20,
              vy: (Math.random() - 0.5) * 20,
              life: 0.6,
              maxLife: 0.6,
              color: '#00f3ff',
              size: 3 + Math.random() * 3,
            });
          }

          // Camera tracks Ghost
          cameraPos.current.x += (ghostPos.current.x - cameraPos.current.x) * (dt * 6.0);
          cameraPos.current.y += (ghostPos.current.y - cameraPos.current.y) * (dt * 6.0);
        } else {
          // Object Driving: apply_central_force driven by WASD
          const pushForce = 700 / possessedObj.mass;
          possessedObj.vx += inputX * pushForce * dt;
          possessedObj.vy += inputY * pushForce * dt;

          // Camera tracks Possessed Object
          cameraPos.current.x += (possessedObj.x - cameraPos.current.x) * (dt * 6.0);
          cameraPos.current.y += (possessedObj.y - cameraPos.current.y) * (dt * 6.0);
          ghostPos.current.x = possessedObj.x;
          ghostPos.current.y = possessedObj.y;
        }

        // Integrate RigidBody2D Physics on all objects
        objectsRef.current.forEach((obj) => {
          // Friction damping
          obj.vx *= 0.965;
          obj.vy *= 0.965;
          obj.x += obj.vx * dt;
          obj.y += obj.vy * dt;

          // High speed streak particles
          const speed = Math.hypot(obj.vx, obj.vy);
          if (speed > 160 && Math.random() < 0.5) {
            particles.current.push({
              x: obj.x,
              y: obj.y,
              vx: -obj.vx * 0.15,
              vy: -obj.vy * 0.15,
              life: 0.25,
              maxLife: 0.25,
              color: obj.isPossessed ? '#00f3ff' : '#94a3b8',
              size: 3,
            });
          }

          // Wall collisions (bounce)
          walls.current.forEach((wall) => {
            const nearestX = Math.max(wall.x, Math.min(obj.x, wall.x + wall.w));
            const nearestY = Math.max(wall.y, Math.min(obj.y, wall.y + wall.h));
            const dist = Math.hypot(obj.x - nearestX, obj.y - nearestY);

            if (dist < obj.radius) {
              const overlap = obj.radius - dist;
              const nx = (obj.x - nearestX) / (dist || 1);
              const ny = (obj.y - nearestY) / (dist || 1);

              obj.x += nx * overlap;
              obj.y += ny * overlap;

              // Reflect velocity with restitution
              const dot = obj.vx * nx + obj.vy * ny;
              obj.vx -= 1.6 * dot * nx;
              obj.vy -= 1.6 * dot * ny;
            }
          });
        });

        // Object-to-object collisions
        for (let i = 0; i < objectsRef.current.length; i++) {
          for (let j = i + 1; j < objectsRef.current.length; j++) {
            const o1 = objectsRef.current[i];
            const o2 = objectsRef.current[j];
            const dx = o2.x - o1.x;
            const dy = o2.y - o1.y;
            const dist = Math.hypot(dx, dy);
            if (dist < o1.radius + o2.radius) {
              const overlap = o1.radius + o2.radius - dist;
              const nx = dx / (dist || 1);
              const ny = dy / (dist || 1);

              o1.x -= nx * overlap * 0.5;
              o1.y -= ny * overlap * 0.5;
              o2.x += nx * overlap * 0.5;
              o2.y += ny * overlap * 0.5;

              // Exchange momentum
              const kx = o1.vx - o2.vx;
              const ky = o1.vy - o2.vy;
              const p = 2 * (nx * kx + ny * ky) / (o1.mass + o2.mass);
              o1.vx -= p * o2.mass * nx;
              o1.vy -= p * o2.mass * ny;
              o2.vx += p * o1.mass * nx;
              o2.vy += p * o1.mass * ny;
            }
          }
        }

        // GUARD AI UPDATE
        const guard = guardRef.current;
        if (guard.state === 'PATROL') {
          const target = waypoints.current[guard.patrolIndex];
          const gdx = target.x - guard.x;
          const gdy = target.y - guard.y;
          const gdist = Math.hypot(gdx, gdy);

          if (gdist > 10) {
            const targetAngle = Math.atan2(gdy, gdx);
            // Smooth rotation
            let diff = targetAngle - guard.angle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            guard.angle += diff * Math.min(dt * 5.0, 1.0);

            guard.x += Math.cos(guard.angle) * guard.speed * dt;
            guard.y += Math.sin(guard.angle) * guard.speed * dt;
          } else {
            guard.patrolIndex = (guard.patrolIndex + 1) % waypoints.current.length;
          }
        } else if (guard.state === 'SUSPICIOUS') {
          guard.stateTimer -= dt;
          if (guard.alertPos) {
            const adx = guard.alertPos.x - guard.x;
            const ady = guard.alertPos.y - guard.y;
            const targetAngle = Math.atan2(ady, adx);
            let diff = targetAngle - guard.angle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            guard.angle += diff * Math.min(dt * 7.0, 1.0);
          }
          if (guard.stateTimer <= 0) {
            guard.state = 'PATROL';
            setGuardStatus('Patrolling');
          }
        } else if (guard.state === 'STUNNED') {
          guard.stateTimer -= dt;
          if (guard.stateTimer <= 0) {
            guard.state = 'PATROL';
            setGuardStatus('Patrolling');
          }
        }

        // GUARD VISION CONE DETECTION (Area2D logic)
        if (guard.state !== 'STUNNED') {
          const visionRange = 210;
          const visionHalfAngle = 0.52; // ~60 degree arc

          objectsRef.current.forEach((obj) => {
            const odx = obj.x - guard.x;
            const ody = obj.y - guard.y;
            const odist = Math.hypot(odx, ody);

            if (odist <= visionRange) {
              const objAngle = Math.atan2(ody, odx);
              let angleDiff = objAngle - guard.angle;
              while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
              while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

              if (Math.abs(angleDiff) <= visionHalfAngle) {
                // Check if wall blocks line of sight
                const isOccluded = walls.current.some((w) => lineIntersectsWall(guard.x, guard.y, obj.x, obj.y, w));

                if (!isOccluded) {
                  // Object is inside the flashlight cone and visible!
                  const speed = Math.hypot(obj.vx, obj.vy);
                  const HIGH_VELOCITY_TRIGGER = 140; // threshold

                  if (speed >= HIGH_VELOCITY_TRIGGER && guard.state !== 'SUSPICIOUS') {
                    // Guard enters Suspicious state for 3 seconds
                    guard.state = 'SUSPICIOUS';
                    guard.stateTimer = 3.0;
                    guard.alertPos = { x: obj.x, y: obj.y };
                    setGuardStatus('!? SUSPICIOUS (3s)');
                    sfx.playGuardSuspicious();

                    // Increase Panic Meter by 20%
                    setPanicMeter((prev) => {
                      const nextVal = Math.min(prev + 20, 100);
                      if (nextVal >= 100) {
                        setIsLockdown(true);
                        sfx.playLockdownAlarm();
                      }
                      return nextVal;
                    });
                  }
                }
              }
            }

            // KNOCKOUT / STUN CHECK: Collision with Guard
            const colDist = Math.hypot(obj.x - guard.x, obj.y - guard.y);
            if (colDist <= obj.radius + 18) {
              const speed = Math.hypot(obj.vx, obj.vy);
              const STUN_VELOCITY_TRIGGER = 220;

              if (speed >= STUN_VELOCITY_TRIGGER && guard.state !== 'STUNNED') {
                guard.state = 'STUNNED';
                guard.stateTimer = 5.0; // 5 seconds stunned
                setGuardStatus('★ STUNNED ★ (5s)');
                sfx.playGuardStun();

                // Spark stars
                for (let k = 0; k < 15; k++) {
                  const a = Math.random() * Math.PI * 2;
                  particles.current.push({
                    x: guard.x,
                    y: guard.y,
                    vx: Math.cos(a) * 90,
                    vy: Math.sin(a) * 90,
                    life: 0.7,
                    maxLife: 0.7,
                    color: '#facc15',
                    size: 4,
                  });
                }
              }
            }
          });
        }

        // Update UI state telemetry
        if (possessedObj) {
          const spd = Math.round(Math.hypot(possessedObj.vx, possessedObj.vy));
          setObjectSpeed(spd);
        } else {
          setObjectSpeed(0);
        }
      }

      // Update Particles
      for (let p = particles.current.length - 1; p >= 0; p--) {
        const pt = particles.current[p];
        pt.life -= dt;
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        if (pt.life <= 0) {
          particles.current.splice(p, 1);
        }
      }

      // 2. RENDER STAGE (Godot 4 Dark Atmospheric WorldEnvironment & 2D Lights)
      // Background: #0a1128 as specified
      ctx.fillStyle = '#0a1128';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw faint floor grid tiles
      ctx.strokeStyle = '#111d42';
      ctx.lineWidth = 1;
      for (let gx = 30; gx <= 970; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, 30);
        ctx.lineTo(gx, 650);
        ctx.stroke();
      }
      for (let gy = 30; gy <= 650; gy += 40) {
        ctx.beginPath();
        ctx.moveTo(30, gy);
        ctx.lineTo(970, gy);
        ctx.stroke();
      }

      // Decorative Room Labels on the floor
      ctx.save();
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#1e293b';
      ctx.letterSpacing = '2px';
      ctx.fillText('WEST GALLERY', 90, 60);
      ctx.fillText('GRAND EXHIBITION HALL', 380, 60);
      ctx.fillText('EAST ARCHIVES & VAULT', 770, 60);
      ctx.restore();

      // Draw Walls / Geometry
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      walls.current.forEach((w) => {
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.strokeRect(w.x, w.y, w.w, w.h);
      });

      // Draw Waypoints (if debug mode on)
      if (showDebug) {
        ctx.strokeStyle = '#475569';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        waypoints.current.forEach((wp, idx) => {
          if (idx === 0) ctx.moveTo(wp.x, wp.y);
          else ctx.lineTo(wp.x, wp.y);
        });
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw Guard's Flashlight Cone (PointLight2D simulation)
      const guard = guardRef.current;
      const coneLength = 220;
      const coneHalfAngle = 0.52; // ~60 deg
      const lightStartAngle = guard.angle - coneHalfAngle;
      const lightEndAngle = guard.angle + coneHalfAngle;

      const lightGrad = ctx.createRadialGradient(guard.x, guard.y, 10, guard.x, guard.y, coneLength);
      if (guard.state === 'STUNNED') {
        lightGrad.addColorStop(0, 'rgba(255, 243, 160, 0.08)');
        lightGrad.addColorStop(1, 'rgba(255, 243, 160, 0)');
      } else if (guard.state === 'SUSPICIOUS') {
        lightGrad.addColorStop(0, 'rgba(255, 220, 80, 0.45)');
        lightGrad.addColorStop(0.7, 'rgba(255, 180, 30, 0.25)');
        lightGrad.addColorStop(1, 'rgba(255, 150, 0, 0)');
      } else {
        lightGrad.addColorStop(0, 'rgba(255, 243, 160, 0.38)');
        lightGrad.addColorStop(0.7, 'rgba(255, 243, 160, 0.18)');
        lightGrad.addColorStop(1, 'rgba(255, 243, 160, 0)');
      }

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(guard.x, guard.y);
      ctx.arc(guard.x, guard.y, coneLength, lightStartAngle, lightEndAngle);
      ctx.closePath();
      ctx.fillStyle = lightGrad;
      ctx.fill();

      // Vision cone perimeter outline
      ctx.strokeStyle = guard.state === 'SUSPICIOUS' ? 'rgba(251, 191, 36, 0.5)' : 'rgba(255, 243, 160, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Draw Particles
      particles.current.forEach((pt) => {
        const alpha = pt.life / pt.maxLife;
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Draw Possessable Objects (RigidBody2D)
      objectsRef.current.forEach((obj) => {
        ctx.save();
        ctx.translate(obj.x, obj.y);

        const isHovered = hoveredObjectId.current === obj.id;

        // Glow effect (Godot 4 WorldEnvironment Bloom HDR emulation)
        if (obj.isPossessed || isHovered) {
          ctx.shadowColor = '#00f3ff';
          ctx.shadowBlur = obj.isPossessed ? 22 : 12;
        }

        // Draw Object shape
        ctx.beginPath();
        ctx.arc(0, 0, obj.radius, 0, Math.PI * 2);

        if (obj.isPossessed) {
          ctx.fillStyle = '#06b6d4';
          ctx.strokeStyle = '#00f3ff';
          ctx.lineWidth = 3;
        } else if (isHovered) {
          ctx.fillStyle = obj.color;
          ctx.strokeStyle = '#00f3ff';
          ctx.lineWidth = 2;
        } else {
          ctx.fillStyle = obj.color;
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.5;
        }
        ctx.fill();
        ctx.stroke();

        // Object icon / decoration
        ctx.fillStyle = '#0f172a';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let symbol = '📦';
        if (obj.type === 'vase') symbol = '🏺';
        if (obj.type === 'clock') symbol = '⏳';
        if (obj.type === 'statue') symbol = '🗿';
        ctx.fillText(symbol, 0, 0);

        // Possessed aura ring
        if (obj.isPossessed) {
          ctx.strokeStyle = '#00f3ff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, obj.radius + 6, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Velocity vector in debug mode
        if (showDebug) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(obj.vx * 0.25, obj.vy * 0.25);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.restore();
      });

      // Draw Guard NPC
      ctx.save();
      ctx.translate(guard.x, guard.y);
      ctx.rotate(guard.angle);

      // Guard Body
      ctx.fillStyle = guard.state === 'STUNNED' ? '#475569' : '#1e3a8a';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Guard Shoulders / Hands holding flashlight
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(8, -6, 12, 12);

      // Flashlight body
      ctx.fillStyle = '#d97706';
      ctx.fillRect(16, -3, 8, 6);

      ctx.restore();

      // Guard Status Badge / Reaction Label
      ctx.save();
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      if (guard.state === 'SUSPICIOUS') {
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('!? SUSPICIOUS', guard.x, guard.y - 24);
      } else if (guard.state === 'STUNNED') {
        ctx.fillStyle = '#93c5fd';
        ctx.fillText('★ STUNNED ★', guard.x, guard.y - 24);
      }
      ctx.restore();

      // Draw Ghost Player (if not possessing)
      if (!isPossessing) {
        ctx.save();
        ctx.translate(ghostPos.current.x, ghostPos.current.y);

        // Neon Cyan HDR Glow
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 18;

        // Ghost body: ethereal floating drop shape
        ctx.fillStyle = 'rgba(0, 243, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(0, -4, 12, Math.PI, 0, false);
        ctx.quadraticCurveTo(12, 14, 0, 16);
        ctx.quadraticCurveTo(-12, 14, -12, -4);
        ctx.closePath();
        ctx.fill();

        // Ghost Eyes
        ctx.fillStyle = '#0a1128';
        ctx.beginPath();
        ctx.arc(-4, -4, 2, 0, Math.PI * 2);
        ctx.arc(4, -4, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Red Screen Tint Overlay on Lockdown
      if (isLockdown) {
        const pulse = 0.35 + 0.15 * Math.sin(currentTime * 0.006);
        ctx.fillStyle = `rgba(220, 38, 38, ${pulse})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isLockdown, isPossessing, showDebug]);

  return (
    <div className="flex flex-col h-full bg-[#070b19] border border-cyan-950/60 rounded-xl overflow-hidden shadow-2xl">
      {/* Top HUD: Panic Meter & Status */}
      <div className="px-5 py-3.5 bg-[#0a1128]/90 border-b border-cyan-900/40 flex items-center justify-between gap-4">
        {/* Panic Meter Bar */}
        <div className="flex-1 max-w-md">
          <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
            <span className="flex items-center gap-1.5 text-cyan-300 font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-cyan-400 animate-pulse" />
              Godot Panic Meter (GameManager)
            </span>
            <span
              className={`font-bold text-sm ${
                panicMeter >= 80 ? 'text-rose-400' : panicMeter >= 40 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {panicMeter}% / 100%
            </span>
          </div>

          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                panicMeter >= 80
                  ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                  : panicMeter >= 40
                  ? 'bg-gradient-to-r from-emerald-500 via-yellow-400 to-amber-500'
                  : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
              }`}
              style={{ width: `${panicMeter}%` }}
            />
          </div>
        </div>

        {/* Live State Badges */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-2">
            <span className="text-slate-500">Form:</span>
            <span className={isPossessing ? 'text-cyan-400 font-bold' : 'text-emerald-400 font-semibold'}>
              {isPossessing ? `Possessing ${possessedName}` : 'Ghost (Free Float)'}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-2">
            <span className="text-slate-500">Guard:</span>
            <span
              className={`font-semibold ${
                guardStatus.includes('STUNNED')
                  ? 'text-indigo-400 font-bold'
                  : guardStatus.includes('SUSPICIOUS')
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-300'
              }`}
            >
              {guardStatus}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-2">
            <span className="text-slate-500">Linear Velocity:</span>
            <span className="text-cyan-300 font-bold">{objectSpeed} px/s</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDebug((prev) => !prev)}
            className={`p-2 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1.5 ${
              showDebug
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Collision Shapes & Velocity Vectors"
          >
            <Eye className="w-4 h-4" />
            Debug
          </button>

          <button
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              sfx.setMuted(nextMuted);
            }}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={resetGame}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-cyan-950"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset (R)
          </button>
        </div>
      </div>

      {/* Main Canvas Simulation Viewport */}
      <div className="relative flex-1 bg-[#0a1128] flex items-center justify-center p-2 select-none overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1000}
          height={680}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          className="rounded-lg shadow-[0_0_35px_rgba(0,0,0,0.8)] border border-cyan-900/30 cursor-crosshair max-w-full max-h-full object-contain"
        />

        {/* Lockdown / Exorcised Full Overlay (100% Panic) */}
        {isLockdown && (
          <div className="absolute inset-0 bg-red-950/70 backdrop-blur-xs flex flex-col items-center justify-center z-20 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-950/90 border-2 border-red-500 rounded-2xl p-8 max-w-md text-center shadow-[0_0_50px_rgba(239,68,68,0.6)]">
              <div className="w-14 h-14 rounded-full bg-red-950/80 border border-red-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-black tracking-widest text-red-500 mb-2 font-mono uppercase">
                LOCKDOWN - EXORCISED
              </h2>
              <p className="text-slate-300 text-sm mb-6 font-mono leading-relaxed">
                Physics engine frozen via <code className="text-red-400">get_tree().paused = true</code>. The guard alert level reached 100%!
              </p>
              <button
                onClick={resetGame}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-mono font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-900/50 cursor-pointer"
              >
                Restart Infiltration (Press R)
              </button>
            </div>
          </div>
        )}

        {/* Floating Quick Controls Bar */}
        <div className="absolute bottom-4 left-6 right-6 pointer-events-none flex items-center justify-between">
          <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-900/50 text-xs text-slate-300 flex items-center gap-4 font-mono shadow-xl">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Compass className="w-3.5 h-3.5" />
              Controls:
            </span>
            <span><strong className="text-white">WASD</strong> Move / Push</span>
            <span><strong className="text-white">L-Click</strong> Possess</span>
            <span><strong className="text-cyan-300">SPACE</strong> Launch</span>
            <span><strong className="text-white">Q / R-Click</strong> Exit</span>
          </div>

          <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-900/50 text-xs text-slate-400 flex items-center gap-2 font-mono">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Launch objects into Guard to STUN them (5s). Avoid fast objects in flashlight beam (+20% Panic).</span>
          </div>
        </div>
      </div>
    </div>
  );
};
