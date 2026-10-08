'use client';

import React, { useEffect, useRef } from 'react';

export interface Futuristic12DCanvasProps {
  className?: string;
  activeToggles?: {
    dna: boolean;
    surges: boolean;
    stars: boolean;
    sacredGeometry: boolean;
    celestialBodies?: boolean;
    compassCoordinates?: boolean;
  };
}

/**
 * 12D COSMIC VASTNESS & CELESTIAL CANVAS
 * Enhanced with:
 * - Distant rotating black hole gravitational accretion disk
 * - Wandering celestial planets & moons with atmospheric rim glow
 * - Detailed real-time geometric compass ring & latitude/longitude telemetry
 * - Interactive starfield with shooting stars & nebula cosmic gas clouds
 * - Code-level golden/cyan DNA helix & Metatron geometric projection
 */
export const Futuristic12DCanvas: React.FC<Futuristic12DCanvasProps> = ({
  className = '',
  activeToggles = {
    dna: true,
    surges: true,
    stars: true,
    sacredGeometry: true,
    celestialBodies: true,
    compassCoordinates: true,
  },
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Cosmic starfield with variable depths
    const stars = Array.from({ length: 90 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 0.02 + 0.005,
      orbitR: Math.random() * 260 + 80,
      orbitAngle: Math.random() * Math.PI * 2,
      orbitSpeed: (Math.random() - 0.5) * 0.006,
    }));

    // Celestial planets
    const planets = [
      {
        orbitR: 320,
        orbitSpeed: 0.0018,
        radius: 9,
        color: '#60a5fa',
        rimColor: 'rgba(147, 197, 253, 0.65)',
        angle: 0.8,
      },
      {
        orbitR: 440,
        orbitSpeed: -0.0012,
        radius: 14,
        color: '#d4af37',
        rimColor: 'rgba(253, 224, 139, 0.7)',
        angle: 2.4,
      },
      {
        orbitR: 210,
        orbitSpeed: 0.0028,
        radius: 6,
        color: '#c084fc',
        rimColor: 'rgba(216, 180, 254, 0.6)',
        angle: 4.1,
      },
    ];

    let surgeEnergy = 0;
    let surgeTimer = 0;
    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // -------------------------------------------------------------
      // 1. DISTANT BLACK HOLE & ACCRETION DISK (Center-Right Depth)
      // -------------------------------------------------------------
      if (activeToggles.celestialBodies !== false) {
        const bhX = cx + Math.min(width * 0.28, 380);
        const bhY = cy - Math.min(height * 0.15, 120);
        const bhRadius = 22;

        ctx.save();
        ctx.translate(bhX, bhY);

        // Gravitational Lensing Outer Warp Glow
        const lensGrad = ctx.createRadialGradient(0, 0, bhRadius * 0.5, 0, 0, bhRadius * 4.2);
        lensGrad.addColorStop(0, 'rgba(0, 0, 0, 0.98)');
        lensGrad.addColorStop(0.3, 'rgba(201, 168, 76, 0.22)');
        lensGrad.addColorStop(0.6, 'rgba(96, 165, 250, 0.12)');
        lensGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = lensGrad;
        ctx.beginPath();
        ctx.arc(0, 0, bhRadius * 4.2, 0, Math.PI * 2);
        ctx.fill();

        // Accretion Disk Swirling Ellipse
        ctx.save();
        ctx.rotate(time * 0.4);
        ctx.scale(1, 0.32); // Inclined orbit plane
        const diskGrad = ctx.createLinearGradient(-bhRadius * 3.5, 0, bhRadius * 3.5, 0);
        diskGrad.addColorStop(0, 'transparent');
        diskGrad.addColorStop(0.25, 'rgba(253, 224, 139, 0.65)');
        diskGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
        diskGrad.addColorStop(0.75, 'rgba(201, 168, 76, 0.6)');
        diskGrad.addColorStop(1, 'transparent');

        ctx.strokeStyle = diskGrad;
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.arc(0, 0, bhRadius * 2.8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, bhRadius * 3.4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Event Horizon (Absolute Singularity)
        ctx.fillStyle = '#030202';
        ctx.beginPath();
        ctx.arc(0, 0, bhRadius, 0, Math.PI * 2);
        ctx.fill();

        // Photon Sphere Bright Ring
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, bhRadius + 0.8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      // -------------------------------------------------------------
      // 2. CELESTIAL PLANETS & ORBITING BODIES
      // -------------------------------------------------------------
      if (activeToggles.celestialBodies !== false) {
        planets.forEach((p) => {
          p.angle += p.orbitSpeed;
          const px = cx + Math.cos(p.angle) * p.orbitR * (width / 950);
          const py = cy + Math.sin(p.angle) * (p.orbitR * 0.38);

          // Orbit guide arc
          ctx.strokeStyle = 'rgba(201, 168, 76, 0.05)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(cx, cy, p.orbitR * 0.38, 0, Math.PI * 2);
          ctx.stroke();

          // Planet Body
          ctx.save();
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.rimColor;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(px, py, p.radius, 0, Math.PI * 2);
          ctx.fill();

          // Planet Crescent Shadow
          const pGrad = ctx.createRadialGradient(
            px - p.radius * 0.3,
            py - p.radius * 0.3,
            p.radius * 0.1,
            px,
            py,
            p.radius
          );
          pGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
          pGrad.addColorStop(0.7, 'transparent');
          pGrad.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.arc(px, py, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      // -------------------------------------------------------------
      // 3. ORBITING STARS & SATELLITES
      // -------------------------------------------------------------
      if (activeToggles.stars) {
        stars.forEach((s, idx) => {
          s.orbitAngle += s.orbitSpeed;
          const starX = cx + Math.cos(s.orbitAngle) * s.orbitR * (width / 900);
          const starY = cy + Math.sin(s.orbitAngle) * (s.orbitR * 0.45);

          const brightness = 0.3 + 0.7 * Math.sin(time * 2 + idx);
          ctx.fillStyle = `rgba(201, 168, 76, ${brightness * 0.65})`;
          ctx.beginPath();
          ctx.arc(starX, starY, s.r, 0, Math.PI * 2);
          ctx.fill();

          if (idx % 7 === 0) {
            ctx.strokeStyle = `rgba(201, 168, 76, 0.15)`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.arc(cx, cy, s.orbitR * 0.45, s.orbitAngle - 0.3, s.orbitAngle);
            ctx.stroke();
          }
        });
      }

      // -------------------------------------------------------------
      // 4. FUNCTIONAL GEOMETRIC COMPASS & TELEMETRY COORDINATES
      // -------------------------------------------------------------
      if (activeToggles.compassCoordinates !== false) {
        const compassRadius = Math.min(width, height) * 0.38;
        ctx.save();
        ctx.translate(cx, cy);

        // Outer Fine Compass Ring
        ctx.strokeStyle = 'rgba(201, 168, 76, 0.18)';
        ctx.lineWidth = 0.75;
        ctx.setLineDash([2, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, compassRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Compass Cardinal Coordinates (N, S, E, W + Azimuth)
        const cardinals = [
          { label: '000° N', angle: -Math.PI / 2 },
          { label: '090° E', angle: 0 },
          { label: '180° S', angle: Math.PI / 2 },
          { label: '270° W', angle: Math.PI },
        ];

        ctx.font = '9px monospace';
        ctx.fillStyle = 'rgba(201, 168, 76, 0.45)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        cardinals.forEach((c) => {
          const tx = Math.cos(c.angle) * (compassRadius + 14);
          const ty = Math.sin(c.angle) * (compassRadius + 14);
          ctx.fillText(c.label, tx, ty);
        });

        // Slow Compass Reticle Pointer
        ctx.save();
        ctx.rotate(-time * 0.05);
        ctx.strokeStyle = 'rgba(201, 168, 76, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -compassRadius);
        ctx.lineTo(0, -compassRadius + 10);
        ctx.moveTo(0, compassRadius);
        ctx.lineTo(0, compassRadius - 10);
        ctx.stroke();
        ctx.restore();

        ctx.restore();
      }

      // -------------------------------------------------------------
      // 5. CODE-LEVEL DNA DOUBLE HELIX
      // -------------------------------------------------------------
      if (activeToggles.dna) {
        const dnaLength = Math.min(width * 0.7, 580);
        const startX = cx - dnaLength / 2;
        const steps = 32;
        const stepWidth = dnaLength / steps;
        const amplitude = 38;

        for (let i = 0; i <= steps; i++) {
          const x = startX + i * stepWidth;
          const angle = time * 1.8 + i * 0.28;
          const y1 = cy + Math.sin(angle) * amplitude;
          const y2 = cy - Math.sin(angle) * amplitude;
          const z1 = Math.cos(angle);

          const alpha1 = 0.35 + 0.45 * (z1 * 0.5 + 0.5);
          const alpha2 = 0.35 + 0.45 * (-z1 * 0.5 + 0.5);

          // Strand 1 (Gold)
          ctx.fillStyle = `rgba(201, 168, 76, ${alpha1})`;
          ctx.beginPath();
          ctx.arc(x, y1, 2.2 + z1 * 0.8, 0, Math.PI * 2);
          ctx.fill();

          // Strand 2 (Crimson/Opal)
          ctx.fillStyle = `rgba(192, 57, 43, ${alpha2})`;
          ctx.beginPath();
          ctx.arc(x, y2, 2.2 - z1 * 0.8, 0, Math.PI * 2);
          ctx.fill();

          if (i % 2 === 0) {
            const rungGrad = ctx.createLinearGradient(x, y1, x, y2);
            rungGrad.addColorStop(0, `rgba(201, 168, 76, ${alpha1 * 0.5})`);
            rungGrad.addColorStop(1, `rgba(192, 57, 43, ${alpha2 * 0.5})`);
            ctx.strokeStyle = rungGrad;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(x, y1);
            ctx.lineTo(x, y2);
            ctx.stroke();
          }
        }
      }

      // -------------------------------------------------------------
      // 6. SACRED GEOMETRIC MOTION
      // -------------------------------------------------------------
      if (activeToggles.sacredGeometry) {
        ctx.save();
        ctx.translate(cx, cy);

        const ringRadii = [60, 110, 160, 210];
        ringRadii.forEach((r, idx) => {
          const rot = idx % 2 === 0 ? time * 0.15 : -time * 0.12;
          ctx.save();
          ctx.rotate(rot);

          ctx.strokeStyle = `rgba(201, 168, 76, ${0.12 - idx * 0.02})`;
          ctx.lineWidth = 0.75;
          ctx.setLineDash([4, 8]);
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          for (let k = 0; k < 6; k++) {
            const ptAngle = (k * Math.PI) / 3;
            const px = Math.cos(ptAngle) * r;
            const py = Math.sin(ptAngle) * r;
            ctx.fillStyle = `rgba(201, 168, 76, 0.25)`;
            ctx.beginPath();
            ctx.arc(px, py, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        });

        ctx.restore();
      }

      // -------------------------------------------------------------
      // 7. ENHANCED ELECTRIC SURGES & EDGE BLOOM
      // -------------------------------------------------------------
      if (activeToggles.surges) {
        surgeTimer++;
        if (surgeTimer % 90 === 0 && Math.random() > 0.4) {
          surgeEnergy = 1.0;
        }

        if (surgeEnergy > 0.02) {
          surgeEnergy *= 0.93;

          ctx.strokeStyle = `rgba(255, 230, 150, ${surgeEnergy * 0.7})`;
          ctx.lineWidth = 1.5;
          ctx.shadowColor = '#C9A84C';
          ctx.shadowBlur = 15;

          ctx.beginPath();
          const startAngle = Math.random() * Math.PI * 2;
          const endAngle = startAngle + (Math.random() - 0.5) * 1.5;
          const r1 = 80;
          const r2 = 240;

          let curX = cx + Math.cos(startAngle) * r1;
          let curY = cy + Math.sin(startAngle) * r1;
          ctx.moveTo(curX, curY);

          const segments = 6;
          for (let seg = 1; seg <= segments; seg++) {
            const t = seg / segments;
            const rCur = r1 + (r2 - r1) * t;
            const aCur = startAngle + (endAngle - startAngle) * t;
            const jitterX = (Math.random() - 0.5) * 35;
            const jitterY = (Math.random() - 0.5) * 35;
            curX = cx + Math.cos(aCur) * rCur + jitterX;
            curY = cy + Math.sin(aCur) * rCur + jitterY;
            ctx.lineTo(curX, curY);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeToggles]);

  return (
    <div className={`relative w-full h-full overflow-hidden pointer-events-none select-none ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 100px rgba(201, 168, 76, 0.08)',
        }}
      />
    </div>
  );
};

export default Futuristic12DCanvas;
