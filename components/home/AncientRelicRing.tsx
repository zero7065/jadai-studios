'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { StudioAudio } from '../../lib/watermark';

export interface AncientRelicRingProps {
  size?: number;
  className?: string;
  onSpinSurge?: () => void;
  accentColor?: string;
}

/**
 * 4K Ultra-Graphic Ancient Powerful Relic Ring
 * Features multi-layered concentric metallic rings, carved glowing runes,
 * realistic inertia physics, drag-to-spin, gyroscopic tilt, and spark particles.
 */
export const AncientRelicRing: React.FC<AncientRelicRingProps> = ({
  size = 360,
  className = '',
  onSpinSurge,
  accentColor = '#C9A84C',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Physical rotational dynamics
  const rotationOuterRef = useRef<number>(0);
  const rotationMiddleRef = useRef<number>(0);
  const rotationInnerRef = useRef<number>(0);
  const velocityRef = useRef<number>(0.003); // Natural slow drift

  const isDraggingRef = useRef<boolean>(false);
  const lastPointerAngleRef = useRef<number>(0);
  const lastPointerTimeRef = useRef<number>(0);
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [pulseGlow, setPulseGlow] = useState(false);

  // Sparks particle system
  const sparksRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string }>>([]);

  const getAngleFromCenter = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx);
  }, []);

  // Pointer drag to spin
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    lastPointerAngleRef.current = getAngleFromCenter(e.clientX, e.clientY);
    lastPointerTimeRef.current = performance.now();
    try {
      StudioAudio.playClick();
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;

    // 3D gyroscopic tilt calculation
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: -dy * 16, y: dx * 16 });

    if (!isDraggingRef.current) return;

    const currentAngle = getAngleFromCenter(e.clientX, e.clientY);
    const now = performance.now();
    let deltaAngle = currentAngle - lastPointerAngleRef.current;

    // Normalize angle jump
    if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
    if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;

    const dt = Math.max(1, now - lastPointerTimeRef.current);
    const instantVelocity = deltaAngle / (dt / 16.6); // Angle per frame

    velocityRef.current = Math.max(-0.25, Math.min(0.25, instantVelocity));
    rotationOuterRef.current += deltaAngle;
    rotationMiddleRef.current -= deltaAngle * 0.7;
    rotationInnerRef.current += deltaAngle * 1.4;

    lastPointerAngleRef.current = currentAngle;
    lastPointerTimeRef.current = now;

    // Emit sparks if spun vigorously
    if (Math.abs(instantVelocity) > 0.05) {
      const ringRadius = (size * 0.42);
      const sparkAngle = currentAngle + (Math.random() - 0.5) * 0.5;
      const sx = Math.cos(sparkAngle) * ringRadius;
      const sy = Math.sin(sparkAngle) * ringRadius;
      sparksRef.current.push({
        x: sx,
        y: sy,
        vx: (Math.random() - 0.5) * 4 + Math.cos(sparkAngle) * 2,
        vy: (Math.random() - 0.5) * 4 + Math.sin(sparkAngle) * 2,
        life: 0,
        maxLife: 20 + Math.random() * 20,
        color: Math.random() > 0.3 ? '#E8C96A' : '#C0392B',
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}

      // Fast spin triggers surge callback
      if (Math.abs(velocityRef.current) > 0.08) {
        setPulseGlow(true);
        setTimeout(() => setPulseGlow(false), 1200);
        if (onSpinSurge) onSpinSurge();
        try {
          StudioAudio.playSuccessArpeggio();
        } catch {}
      }
    }
  };

  const triggerRingSurge = () => {
    velocityRef.current = 0.12;
    setPulseGlow(true);
    setTimeout(() => setPulseGlow(false), 1200);
    if (onSpinSurge) onSpinSurge();
    try {
      StudioAudio.playSuccessArpeggio();
    } catch {}
  };

  // High-DPI Canvas Rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const cx = (size * dpr) / 2;
    const cy = (size * dpr) / 2;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Inertial damping
      if (!isDraggingRef.current) {
        rotationOuterRef.current += velocityRef.current;
        rotationMiddleRef.current -= velocityRef.current * 0.65;
        rotationInnerRef.current += velocityRef.current * 1.35;

        // Friction towards baseline drift
        if (Math.abs(velocityRef.current) > 0.0035) {
          velocityRef.current *= 0.965;
        } else {
          velocityRef.current = 0.003;
        }
      }

      ctx.save();
      ctx.translate(cx, cy);

      const rOuter = (size * 0.45) * dpr;
      const rMiddle = (size * 0.35) * dpr;
      const rInner = (size * 0.23) * dpr;
      const rCore = (size * 0.12) * dpr;

      // -------------------------------------------------------------
      // 1. OUTER CELESTIAL RUNIC RING (Burnished Gold & Bronze)
      // -------------------------------------------------------------
      ctx.save();
      ctx.rotate(rotationOuterRef.current);

      // Outer metallic bevel glow
      const outerGrad = ctx.createRadialGradient(0, 0, rOuter - 18 * dpr, 0, 0, rOuter + 6 * dpr);
      outerGrad.addColorStop(0, 'rgba(10, 9, 8, 0.9)');
      outerGrad.addColorStop(0.5, 'rgba(201, 168, 76, 0.4)');
      outerGrad.addColorStop(0.85, 'rgba(232, 201, 106, 0.8)');
      outerGrad.addColorStop(1, 'rgba(10, 9, 8, 0.1)');

      ctx.beginPath();
      ctx.arc(0, 0, rOuter, 0, Math.PI * 2);
      ctx.lineWidth = 14 * dpr;
      ctx.strokeStyle = outerGrad;
      ctx.stroke();

      // Outer rim fine hairline
      ctx.beginPath();
      ctx.arc(0, 0, rOuter + 6 * dpr, 0, Math.PI * 2);
      ctx.lineWidth = 1.2 * dpr;
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.6)';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, rOuter - 7 * dpr, 0, Math.PI * 2);
      ctx.lineWidth = 1 * dpr;
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.5)';
      ctx.stroke();

      // 24 Ancient Astrological Runes / Notches
      const runeCount = 24;
      for (let i = 0; i < runeCount; i++) {
        const angle = (i * Math.PI * 2) / runeCount;
        ctx.save();
        ctx.rotate(angle);

        // Notches
        ctx.beginPath();
        ctx.moveTo(rOuter - 7 * dpr, 0);
        ctx.lineTo(rOuter + 5 * dpr, 0);
        ctx.lineWidth = i % 4 === 0 ? 2.5 * dpr : 1.2 * dpr;
        ctx.strokeStyle = i % 4 === 0 ? '#E8C96A' : 'rgba(201, 168, 76, 0.5)';
        ctx.stroke();

        // Glowing Rune Dots / Diamonds
        if (i % 2 === 0) {
          ctx.beginPath();
          ctx.arc(rOuter - 1 * dpr, 0, 2.2 * dpr, 0, Math.PI * 2);
          ctx.fillStyle = i % 6 === 0 ? '#FFFFFF' : '#E8C96A';
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.restore();

      // -------------------------------------------------------------
      // 2. MIDDLE CHRONOMETER RADIANT RING (Counter-Rotating)
      // -------------------------------------------------------------
      ctx.save();
      ctx.rotate(rotationMiddleRef.current);

      // Warm burnished gold and starlight bronze band
      const midGrad = ctx.createRadialGradient(0, 0, rMiddle - 14 * dpr, 0, 0, rMiddle + 14 * dpr);
      midGrad.addColorStop(0, 'rgba(25, 20, 12, 0.95)');
      midGrad.addColorStop(0.3, 'rgba(45, 36, 20, 0.9)');
      midGrad.addColorStop(0.7, 'rgba(201, 168, 76, 0.35)');
      midGrad.addColorStop(1, 'rgba(232, 201, 106, 0.45)');

      ctx.beginPath();
      ctx.arc(0, 0, rMiddle, 0, Math.PI * 2);
      ctx.lineWidth = 18 * dpr;
      ctx.strokeStyle = midGrad;
      ctx.stroke();

      // Interlocking Chronometer Gear Teeth (36 teeth)
      const gearTeeth = 36;
      for (let i = 0; i < gearTeeth; i++) {
        const angle = (i * Math.PI * 2) / gearTeeth;
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.rect(rMiddle - 8 * dpr, -1.2 * dpr, 16 * dpr, 2.4 * dpr);
        ctx.fillStyle = i % 3 === 0 ? 'rgba(232, 201, 106, 0.85)' : 'rgba(201, 168, 76, 0.6)';
        ctx.fill();
        ctx.restore();
      }

      // Constellation connectors
      ctx.beginPath();
      ctx.arc(0, 0, rMiddle - 9 * dpr, 0, Math.PI * 2);
      ctx.setLineDash([4 * dpr, 4 * dpr]);
      ctx.lineWidth = 1 * dpr;
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.4)';
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // -------------------------------------------------------------
      // 3. INNER METATRON GYRO RING (Fast Forward Spin)
      // -------------------------------------------------------------
      ctx.save();
      ctx.rotate(rotationInnerRef.current);

      ctx.beginPath();
      ctx.arc(0, 0, rInner, 0, Math.PI * 2);
      ctx.lineWidth = 3 * dpr;
      ctx.strokeStyle = 'rgba(232, 201, 106, 0.85)';
      ctx.stroke();

      // Inscribed Sacred Hexagram
      const pts = 6;
      ctx.beginPath();
      for (let i = 0; i <= pts; i++) {
        const a = (i * Math.PI * 2) / pts;
        const x = Math.cos(a) * rInner;
        const y = Math.sin(a) * rInner;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineWidth = 1.2 * dpr;
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.6)';
      ctx.stroke();

      // 6 Gimbal Pivot Nodes
      for (let i = 0; i < pts; i++) {
        const a = (i * Math.PI * 2) / pts;
        const x = Math.cos(a) * rInner;
        const y = Math.sin(a) * rInner;
        ctx.beginPath();
        ctx.arc(x, y, 3.5 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = '#E8C96A';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 1.5 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFDF5';
        ctx.fill();
      }
      ctx.restore();

      // -------------------------------------------------------------
      // 4. CENTRAL CRYSTALLINE CELESTIAL STAR CORE (Radiant Divine Starlight)
      // -------------------------------------------------------------
      ctx.save();
      const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, rCore);
      coreGrad.addColorStop(0, '#FFFFFF');
      coreGrad.addColorStop(0.3, '#FFF4D4');
      coreGrad.addColorStop(0.65, '#E8C96A');
      coreGrad.addColorStop(0.9, 'rgba(201, 168, 76, 0.35)');
      coreGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(0, 0, rCore, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Sacred Inner Luminous Star Diamond Core
      ctx.beginPath();
      ctx.arc(0, 0, rCore * 0.45, 0, Math.PI * 2);
      ctx.lineWidth = 1.2 * dpr;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, rCore * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.restore();

      // -------------------------------------------------------------
      // 5. PARTICLE SPARKS UPDATE & DRAW
      // -------------------------------------------------------------
      for (let i = sparksRef.current.length - 1; i >= 0; i--) {
        const s = sparksRef.current[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.95;
        s.vy *= 0.95;
        s.life++;

        const alpha = 1 - s.life / s.maxLife;
        if (alpha <= 0) {
          sparksRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(s.x * dpr, s.y * dpr, (1.8 + Math.random() * 1.5) * dpr, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [size]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setTilt({ x: 0, y: 0 });
      }}
      onClick={triggerRingSurge}
      style={{
        width: size,
        height: size,
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isHovered ? 1.05 : 1}, ${isHovered ? 1.05 : 1}, 1)`,
        transformStyle: 'preserve-3d',
        transition: isDraggingRef.current ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
        touchAction: 'none',
      }}
      className={`relative cursor-grab active:cursor-grabbing select-none flex items-center justify-center ${className}`}
      title="Ancient Celestial Ring • Touch or Drag to Spin"
    >
      {/* Radiant Specular Back-Glow */}
      <div
        className={`absolute inset-0 rounded-full pointer-events-none transition-all duration-700 ${
          pulseGlow
            ? 'opacity-80 scale-110 shadow-[0_0_90px_rgba(201,168,76,0.65)]'
            : 'opacity-40 shadow-[0_0_50px_rgba(201,168,76,0.25)]'
        }`}
        style={{
          background: 'radial-gradient(circle, rgba(201,168,76,0.2) 0%, rgba(192,57,43,0.1) 45%, transparent 70%)',
        }}
      />

      {/* 4K Canvas Surface */}
      <canvas ref={canvasRef} className="relative z-10 block pointer-events-none" />

      {/* Subtle Drag Prompt Indicator */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-[#e8c96a] bg-black/80 px-3 py-1 rounded-full border border-[rgba(201,168,76,0.2)]">
        <span>Drag to rotate ancient ring ↺</span>
      </div>
    </div>
  );
};

export default AncientRelicRing;
