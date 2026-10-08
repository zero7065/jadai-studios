'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface AmbientBackgroundProps {
  variant?: 'particles' | 'liquid';
  className?: string;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  variant = 'particles',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [isLowEnd, setIsLowEnd] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // 1. Feature detection & prefers-reduced-motion check
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check prefers-reduced-motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    const motionHandler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', motionHandler);

    // Feature-detect low-end device
    const concurrency = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 8;
    // Low-end if concurrency <= 2 or memory <= 2
    if (concurrency <= 2 || memory <= 2) {
      setIsLowEnd(true);
    }

    return () => motionQuery.removeEventListener('change', motionHandler);
  }, []);

  // 2. Pause when tab is hidden or scrolled off screen via IntersectionObserver
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

  // 3. WebGL / Canvas slow-drifting nodes connected by faint hairline lines ("12D futuristic")
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

    // Node count scaled to screen size (moderate density for optimal 60fps)
    const nodeCount = Math.min(38, Math.max(18, Math.floor((width * height) / 45000)));

    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
    }

    const nodes: Node[] = [];
    const colors = [
      'rgba(201, 168, 76, ', // Gold
      'rgba(232, 201, 106, ', // Bright gold
      'rgba(192, 57, 43, ', // Crimson accent
    ];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35, // slow drifting
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.8 + 1.2,
        color: colors[i % 5 === 0 ? 2 : i % 2], // occasional crimson, mostly gold
        alpha: Math.random() * 0.4 + 0.2,
      });
    }

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min(40, time - lastTime);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Render connected lines (faint lines between close nodes, gold/crimson)
      const maxDistance = 140;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * 0.12;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(201, 168, 76, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // Render nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        node.x += node.vx * (delta / 16);
        node.y += node.vy * (delta / 16);

        // Wrap around boundaries gently
        if (node.x < -10) node.x = width + 10;
        if (node.x > width + 10) node.x = -10;
        if (node.y < -10) node.y = height + 10;
        if (node.y > height + 10) node.y = -10;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}${node.alpha})`;
        ctx.shadowColor = 'rgba(201, 168, 76, 0.4)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [reducedMotion, isLowEnd, isVisible, variant]);

  // Reduced motion: swap to static gradient + sacred-geometry linework, zero motion
  if (reducedMotion) {
    return (
      <div
        ref={containerRef}
        aria-hidden="true"
        className={`fixed inset-0 pointer-events-none select-none z-0 ${className}`}
        style={{
          background: 'radial-gradient(circle at 50% 20%, rgba(201, 168, 76, 0.05) 0%, #050404 70%)',
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, #C9A84C 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>
    );
  }

  // Low-end device: lighter CSS-gradient-only version without WebGL / canvas
  if (isLowEnd) {
    return (
      <div
        ref={containerRef}
        aria-hidden="true"
        className={`fixed inset-0 pointer-events-none select-none z-0 ${className}`}
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(201, 168, 76, 0.04) 0%, #050404 65%)',
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none select-none z-0 overflow-hidden ${className}`}
    >
      {/* Deep Void Base Radial */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 90% 70% at 50% 10%, rgba(201, 168, 76, 0.05) 0%, rgba(5,4,4,0) 70%)',
        }}
      />
      {/* Canvas Particle-and-Gradient Node Field */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default AmbientBackground;
