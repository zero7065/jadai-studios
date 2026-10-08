'use client';

import React, { useEffect, useRef, useState } from 'react';

export type AtmosphereMode =
  | 'home'
  | 'tools'
  | 'book-of-lies'
  | 'marketplace'
  | 'community'
  | 'signal'
  | 'admin';

export interface PersistentAtmosphereCanvasProps {
  currentPath?: string;
  className?: string;
}

interface VisualProfile {
  primaryColor: [number, number, number]; // [r, g, b]
  secondaryColor: [number, number, number];
  nodeCount: number;
  speed: number;
  lineMaxDist: number;
  lineOpacity: number;
  glowRadius: number;
  scanline: boolean;
  radarPulse: boolean;
  starsCount: number;
  surges: boolean;
}

const PROFILES: Record<AtmosphereMode, VisualProfile> = {
  home: {
    primaryColor: [201, 168, 76], // Gold #C9A84C
    secondaryColor: [192, 57, 43], // Crimson #C0392B
    nodeCount: 36,
    speed: 0.35,
    lineMaxDist: 140,
    lineOpacity: 0.14,
    glowRadius: 18,
    scanline: false,
    radarPulse: false,
    starsCount: 45,
    surges: true,
  },
  tools: {
    primaryColor: [232, 201, 106], // Bright Amber
    secondaryColor: [74, 144, 226], // Cyan / Electric blue
    nodeCount: 30,
    speed: 0.5,
    lineMaxDist: 120,
    lineOpacity: 0.16,
    glowRadius: 14,
    scanline: true,
    radarPulse: false,
    starsCount: 20,
    surges: true,
  },
  'book-of-lies': {
    primaryColor: [192, 57, 43], // Deep Crimson
    secondaryColor: [138, 110, 42], // Deep Gold
    nodeCount: 26,
    speed: 0.28,
    lineMaxDist: 110,
    lineOpacity: 0.12,
    glowRadius: 22,
    scanline: false,
    radarPulse: false,
    starsCount: 35,
    surges: false,
  },
  marketplace: {
    primaryColor: [212, 165, 116], // Champagne Gold
    secondaryColor: [46, 204, 113], // Emerald
    nodeCount: 32,
    speed: 0.32,
    lineMaxDist: 135,
    lineOpacity: 0.13,
    glowRadius: 20,
    scanline: false,
    radarPulse: false,
    starsCount: 30,
    surges: false,
  },
  community: {
    primaryColor: [201, 168, 76], // Gold
    secondaryColor: [142, 68, 173], // Amethyst
    nodeCount: 42,
    speed: 0.4,
    lineMaxDist: 160,
    lineOpacity: 0.18,
    glowRadius: 16,
    scanline: false,
    radarPulse: false,
    starsCount: 55,
    surges: true,
  },
  signal: {
    primaryColor: [201, 168, 76], // Gold
    secondaryColor: [231, 76, 60], // Crimson
    nodeCount: 28,
    speed: 0.45,
    lineMaxDist: 130,
    lineOpacity: 0.15,
    glowRadius: 16,
    scanline: false,
    radarPulse: true,
    starsCount: 25,
    surges: true,
  },
  admin: {
    primaryColor: [138, 110, 42], // Muted gold
    secondaryColor: [74, 71, 68], // Obsidian grey
    nodeCount: 22,
    speed: 0.25,
    lineMaxDist: 100,
    lineOpacity: 0.1,
    glowRadius: 12,
    scanline: true,
    radarPulse: false,
    starsCount: 15,
    surges: false,
  },
};

function getModeFromPath(path: string): AtmosphereMode {
  if (path.startsWith('/admin')) return 'admin';
  if (
    path.startsWith('/playground') ||
    path.startsWith('/services') ||
    path.startsWith('/create') ||
    path.startsWith('/write')
  ) {
    return 'tools';
  }
  if (path.startsWith('/book-of-lies')) return 'book-of-lies';
  if (path.startsWith('/marketplace')) return 'marketplace';
  if (path.startsWith('/community') || path.startsWith('/hub') || path.startsWith('/u/')) {
    return 'community';
  }
  if (path.startsWith('/signal')) return 'signal';
  return 'home';
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  pulsePhase: number;
  colorType: 'primary' | 'secondary';
}

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  speed: number;
}

export const PersistentAtmosphereCanvas: React.FC<PersistentAtmosphereCanvasProps> = React.memo(
  ({ currentPath = '/', className = '' }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const animFrameRef = useRef<number | null>(null);

    const [isLowEnd, setIsLowEnd] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    // Target profile based on currentPath (updated without remounting)
    const targetMode = getModeFromPath(currentPath);
    const targetProfileRef = useRef<VisualProfile>(PROFILES[targetMode]);
    targetProfileRef.current = PROFILES[targetMode];

    // Current interpolated properties
    const currentPropsRef = useRef<{
      primaryColor: [number, number, number];
      secondaryColor: [number, number, number];
      speed: number;
      lineMaxDist: number;
      lineOpacity: number;
      glowRadius: number;
      radarPulse: number;
      scanlineY: number;
      surgeAlpha: number;
      surgeCooldown: number;
    }>({
      primaryColor: [...PROFILES[targetMode].primaryColor],
      secondaryColor: [...PROFILES[targetMode].secondaryColor],
      speed: PROFILES[targetMode].speed,
      lineMaxDist: PROFILES[targetMode].lineMaxDist,
      lineOpacity: PROFILES[targetMode].lineOpacity,
      glowRadius: PROFILES[targetMode].glowRadius,
      radarPulse: 0,
      scanlineY: 0,
      surgeAlpha: 0,
      surgeCooldown: 120,
    });

    // 1. Accessibility & Low-end detection
    useEffect(() => {
      if (typeof window === 'undefined') return;

      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(motionQuery.matches);
      const motionHandler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      motionQuery.addEventListener('change', motionHandler);

      const concurrency = navigator.hardwareConcurrency || 4;
      const memory = (navigator as any).deviceMemory || 8;
      if (concurrency <= 2 || memory <= 2) {
        setIsLowEnd(true);
      }

      return () => motionQuery.removeEventListener('change', motionHandler);
    }, []);

    // 2. Tab visibility & Viewport IntersectionObserver
    useEffect(() => {
      if (typeof window === 'undefined') return;

      const handleVisibilityChange = () => {
        setIsVisible(!document.hidden);
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setIsVisible(entry.isIntersecting && !document.hidden);
          });
        },
        { threshold: 0.05 }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        observer.disconnect();
      };
    }, []);

    // 3. Persistent 60fps canvas loop with property interpolation
    useEffect(() => {
      if (reducedMotion || isLowEnd || !isVisible) {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      let width = (canvas.width = window.innerWidth);
      let height = (canvas.height = window.innerHeight);

      const handleResize = () => {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', handleResize);

      // Create persistent node pool
      const maxNodes = 48;
      const nodes: Node[] = [];
      for (let i = 0; i < maxNodes; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          baseRadius: Math.random() * 1.8 + 1.2,
          pulsePhase: Math.random() * Math.PI * 2,
          colorType: i % 4 === 0 ? 'secondary' : 'primary',
        });
      }

      // Create persistent stars pool
      const stars: Star[] = [];
      for (let i = 0; i < 60; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.5,
          brightness: Math.random() * 0.7 + 0.3,
          speed: Math.random() * 0.02 + 0.005,
        });
      }

      let frameCount = 0;

      const render = () => {
        frameCount++;
        const target = targetProfileRef.current;
        const current = currentPropsRef.current;

        // Smoothly interpolate visual properties towards target
        const lerpFactor = 0.05;
        for (let c = 0; c < 3; c++) {
          current.primaryColor[c] += (target.primaryColor[c] - current.primaryColor[c]) * lerpFactor;
          current.secondaryColor[c] += (target.secondaryColor[c] - current.secondaryColor[c]) * lerpFactor;
        }
        current.speed += (target.speed - current.speed) * lerpFactor;
        current.lineMaxDist += (target.lineMaxDist - current.lineMaxDist) * lerpFactor;
        current.lineOpacity += (target.lineOpacity - current.lineOpacity) * lerpFactor;
        current.glowRadius += (target.glowRadius - current.glowRadius) * lerpFactor;

        // Update radar pulse
        if (target.radarPulse) {
          current.radarPulse = (current.radarPulse + 1.5) % (Math.min(width, height) * 0.6);
        }

        // Update scanline position
        if (target.scanline) {
          current.scanlineY = (current.scanlineY + 1.2) % height;
        }

        // Electric surge generator
        if (target.surges) {
          current.surgeCooldown--;
          if (current.surgeCooldown <= 0) {
            current.surgeAlpha = 0.35;
            current.surgeCooldown = Math.floor(Math.random() * 240 + 180);
          }
          if (current.surgeAlpha > 0) {
            current.surgeAlpha *= 0.92;
            if (current.surgeAlpha < 0.01) current.surgeAlpha = 0;
          }
        } else {
          current.surgeAlpha = 0;
        }

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // 1. Render background subtle stars
        const starLimit = Math.min(target.starsCount, stars.length);
        for (let i = 0; i < starLimit; i++) {
          const s = stars[i];
          s.brightness = 0.3 + 0.5 * Math.sin(frameCount * s.speed + i);
          ctx.fillStyle = `rgba(255, 255, 255, ${s.brightness * 0.4})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // 2. Render radar ripple if active
        if (target.radarPulse && current.radarPulse > 0) {
          const cx = width / 2;
          const cy = height / 2;
          const r = current.radarPulse;
          const pulseAlpha = Math.max(0, 0.25 * (1 - r / (Math.min(width, height) * 0.6)));

          ctx.strokeStyle = `rgba(${Math.round(current.primaryColor[0])}, ${Math.round(
            current.primaryColor[1]
          )}, ${Math.round(current.primaryColor[2])}, ${pulseAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // 3. Render scanline if active
        if (target.scanline) {
          const grad = ctx.createLinearGradient(0, current.scanlineY - 4, 0, current.scanlineY + 4);
          grad.addColorStop(0, 'rgba(201, 168, 76, 0)');
          grad.addColorStop(0.5, 'rgba(201, 168, 76, 0.08)');
          grad.addColorStop(1, 'rgba(201, 168, 76, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, current.scanlineY - 4, width, 8);
        }

        // 4. Render electric surge flash across random nodes
        if (current.surgeAlpha > 0.02) {
          ctx.strokeStyle = `rgba(255, 220, 140, ${current.surgeAlpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          const n1 = nodes[Math.floor(Math.random() * target.nodeCount)];
          const n2 = nodes[Math.floor(Math.random() * target.nodeCount)];
          if (n1 && n2) {
            ctx.moveTo(n1.x, n1.y);
            const midX = (n1.x + n2.x) / 2 + (Math.random() - 0.5) * 40;
            const midY = (n1.y + n2.y) / 2 + (Math.random() - 0.5) * 40;
            ctx.lineTo(midX, midY);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }

        // 5. Update and render nodes & connecting hairline lines
        const activeNodeCount = Math.min(target.nodeCount, nodes.length);
        const pR = Math.round(current.primaryColor[0]);
        const pG = Math.round(current.primaryColor[1]);
        const pB = Math.round(current.primaryColor[2]);
        const sR = Math.round(current.secondaryColor[0]);
        const sG = Math.round(current.secondaryColor[1]);
        const sB = Math.round(current.secondaryColor[2]);

        for (let i = 0; i < activeNodeCount; i++) {
          const n = nodes[i];

          // Advance node position
          n.x += n.vx * current.speed;
          n.y += n.vy * current.speed;

          // Soft toroidal bounce
          if (n.x < 0) {
            n.x = 0;
            n.vx *= -1;
          } else if (n.x > width) {
            n.x = width;
            n.vx *= -1;
          }
          if (n.y < 0) {
            n.y = 0;
            n.vy *= -1;
          } else if (n.y > height) {
            n.y = height;
            n.vy *= -1;
          }

          n.pulsePhase += 0.025;
          const pulse = 1 + 0.25 * Math.sin(n.pulsePhase);
          const radius = n.baseRadius * pulse;

          // Draw connections between nearby nodes
          for (let j = i + 1; j < activeNodeCount; j++) {
            const n2 = nodes[j];
            const dx = n.x - n2.x;
            const dy = n.y - n2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < current.lineMaxDist) {
              const alpha = current.lineOpacity * (1 - dist / current.lineMaxDist);
              ctx.strokeStyle = `rgba(${pR}, ${pG}, ${pB}, ${alpha})`;
              ctx.lineWidth = 0.75;
              ctx.beginPath();
              ctx.moveTo(n.x, n.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.stroke();
            }
          }

          // Draw node halo and center
          const isSec = n.colorType === 'secondary';
          const rColor = isSec ? sR : pR;
          const gColor = isSec ? sG : pG;
          const bColor = isSec ? sB : pB;

          // Glow halo
          const glowGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, current.glowRadius);
          glowGrad.addColorStop(0, `rgba(${rColor}, ${gColor}, ${bColor}, 0.35)`);
          glowGrad.addColorStop(1, `rgba(${rColor}, ${gColor}, ${bColor}, 0)`);
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(n.x, n.y, current.glowRadius, 0, Math.PI * 2);
          ctx.fill();

          // Center core point
          ctx.fillStyle = `rgba(${rColor}, ${gColor}, ${bColor}, 0.85)`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        animFrameRef.current = requestAnimationFrame(render);
      };

      animFrameRef.current = requestAnimationFrame(render);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
    }, [reducedMotion, isLowEnd, isVisible]);

    // Fallback for reduced-motion or low-end devices: static CSS gradient without canvas overhead
    if (reducedMotion || isLowEnd) {
      return (
        <div
          ref={containerRef}
          aria-hidden="true"
          className={`fixed inset-0 pointer-events-none select-none overflow-hidden ${className}`}
          style={{
            background:
              'radial-gradient(circle at 50% 30%, rgba(201, 168, 76, 0.05) 0%, rgba(5, 4, 4, 0.98) 75%)',
            zIndex: 0,
          }}
        />
      );
    }

    return (
      <div
        ref={containerRef}
        aria-hidden="true"
        className={`fixed inset-0 pointer-events-none select-none overflow-hidden ${className}`}
        style={{ zIndex: 0 }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      </div>
    );
  }
);

PersistentAtmosphereCanvas.displayName = 'PersistentAtmosphereCanvas';

export default PersistentAtmosphereCanvas;
